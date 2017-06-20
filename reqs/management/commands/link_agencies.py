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
        Otherwise, try to extract agencies and agency groups from the
        impacted_entity value and create relationships accordingly.
        """
        for requirement in Requirement.objects.iterator():
            impacted = requirement.impacted_entity.lower()
            if not impacted:
                continue

            with reversion.create_revision():
                agencies = extract_agencies(impacted)
                requirement.agencies.add(*agencies)
                reversion.set_comment(
                    "Add agency via extraction from impacted_entity.")

            with reversion.create_revision():
                groups = extract_groups(impacted)
                requirement.agency_groups.add(*groups)
                reversion.set_comment(
                    "Add agency group via extraction from impacted_entity.")


def extract_agencies(entities: str) -> List[Agency]:
    """
    Look for matches in the string of impacted_entity and accordingly return a
    list of agencies.

    This is currently very primitive matching, but we may eventually want to do
    proper cleanup and splitting on the entities argument.
    """
    conditions_abbrs = (
        ("dhs" in entities or "department of homeland" in entities, "DHS"),
        ("gsa" in entities or "general services" in entities, "GSA"),
        ("dod" in entities or "defense" in entities, "DOD"),
        ("doj" in entities or "justice" in entities, "Justice"),
    )
    matched_abbrs = [abbr for (cond, abbr) in conditions_abbrs if cond]

    return Agency.objects.filter(abbr__in=matched_abbrs)


def extract_groups(entities: str) -> List[AgencyGroup]:
    """
    Look for matches in the string of impacted_entity and accordingly return a
    list of agency groups.

    This is currently very primitive matching, but we may eventually want to do
    proper cleanup and splitting on the entities argument.
    """
    conditions_slugs = (
        ("cfo" in entities and "federal cfo council" not in entities,
         "cfo-act"),
        (all([
            "all agencies" in entities,
            "micro" not in entities,
            "paperwork" not in entities,
        ]), "all-agencies"),
    )
    matched_slugs = [slug for (cond, slug) in conditions_slugs if cond]

    return AgencyGroup.objects.filter(slug__in=matched_slugs)


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


def reset_agency_relationships() -> None:
    """
    Remove all agency relationships from the database.
    Not used in production code, but left in as a convenience method for
    resetting state during development.
    """
    Requirement.agencies.through.objects.all().delete()
    Requirement.agency_groups.through.objects.all().delete()
