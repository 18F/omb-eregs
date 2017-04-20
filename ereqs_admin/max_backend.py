import logging

from django.contrib.auth.models import User
from django_cas_ng.backends import CASBackend
from django_cas_ng.utils import get_cas_client

logger = logging.getLogger(__name__)


def update_user_attributes(user, attributes):
    # Trim to thirty chars to match Django User max lengths
    user.first_name = attributes.get('First-Name', '')[:30]
    user.last_name = attributes.get('Last-Name', '')[:30]
    user.email = attributes.get('Email-Address', '')
    user.is_staff = True
    user.save()


class MAXBackend(CASBackend):
    """A specific version of the CASBackend which uses email address as the
    username"""
    def authenticate(self, request, ticket, service):
        client = get_cas_client(service_url=service)
        max_username, attributes, _ = client.verify_ticket(ticket)
        if not max_username:    # bad ticket
            logger.warning("MAX ticket (%s) lookup was unsuccessful. "
                           "Received attributes: %s", ticket, attributes)
            return None

        email = attributes.get('Email-Address', '')

        user = User.objects.filter(username=email).first()
        if user:
            update_user_attributes(user, attributes)
            logger.info("User %s successfully logged in", email)
            return user
        else:
            logger.warning("MAX ticket (%s) referred to a user not in our "
                           "system: %s. Received attributes: %s",
                           ticket, email, attributes)
