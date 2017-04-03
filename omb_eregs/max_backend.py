from django.contrib.auth.models import User
from django_cas_ng.backends import CASBackend
from django_cas_ng.utils import get_cas_client


class MAXBackend(CASBackend):
    """A specific version of the CASBackend which uses email address as the
    username"""
    def authenticate(self, request, ticket, service):
        client = get_cas_client(service_url=service)
        max_username, attributes, _ = client.verify_ticket(ticket)
        if not max_username:    # bad ticket
            return None

        email = attributes.get('Email-Address', '')

        user = User.objects.filter(username=email).first()
        if user:
            user.first_name = attributes.get('First-Name', '')[:30]
            user.last_name = attributes.get('Last-Name', '')[:30]
            user.email = email
            user.is_staff = True
            user.save()

            return user
