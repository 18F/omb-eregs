from functools import singledispatch
from typing import List, Union

import reversion
from django.core.management.base import BaseCommand

from reqs.models import Agency, AgencyGroup, Requirement


class Command(BaseCommand):
    help = ("Associate agencies and agency groups with requirements "  # noqa
            "based on impacted entity field.")

    def handle(self, *args, **options) -> None:
        self.process_requirements()

    def process_requirements(self) -> None:
        """
        Go through each requirement.
        If its impacted_entity field is blank, return the requirement.
        Otherwise, pass the value of impacted_entity to extract_entities,
        then pass the result to create_relationship.
        """
        for requirement in Requirement.objects.all():
            impacted = requirement.impacted_entity.lower()
            if not impacted:
                continue

            entities = extract_entities(impacted)
            for entity in entities:
                create_relationship(entity, requirement)


def extract_entities(entities: str) -> List[Union[Agency, AgencyGroup]]:
    """
    Look for matches in the string of impacted_entity and accordingly return a
    list of agencies and agency groups.

    This is currently very primitive matching, but we may eventually want to do
    proper cleanup and splitting on the entities argument.
    """
    matched_entities = []
    cond_lookup_groups = (
        ("cfo" in entities and "federal cfo council" not in entities,
         "cfo-act"),
        (all([
            "all agencies" in entities,
            "micro" not in entities,
            "paperwork" not in entities,
        ]), "all-agencies"),
    )
    cond_lookup_agencies = (
        ("dhs" in entities or "department of homeland" in entities, "DHS"),
        ("gsa" in entities or "general services" in entities, "GSA"),
        ("dod" in entities or "defense" in entities, "DOD"),
        ("doj" in entities or "justice" in entities, "Justice"),
    )

    for cond, lookup in cond_lookup_groups:
        if cond:
            matched_entities.append(AgencyGroup.objects.get(slug=lookup))

    for cond, lookup in cond_lookup_agencies:
        if cond:
            matched_entities.append(Agency.objects.get(abbr=lookup))

    return matched_entities


@singledispatch
@reversion.create_revision()
def create_relationship(entity: Agency, requirement: Requirement) -> None:
    requirement.agencies.add(entity)
    reversion.set_comment("Add agency.")


@create_relationship.register(AgencyGroup)
@reversion.create_revision()
def crg(entity: AgencyGroup, requirement: Requirement) -> None:
    requirement.agency_groups.add(entity)
    reversion.set_comment("Add agency group.")


def reset_agency_relationships() -> None:
    """
    Remove all agency relationships from the database.
    """
    for requirement in Requirement.objects.all():
        requirement.agencies.clear()
        requirement.agency_groups.clear()
