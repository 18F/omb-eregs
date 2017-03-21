from django.conf import settings


def show_toolbar(request):
    """By default, Django Debug Toolbar checks the IP of the requester against
    a whitelist. Unfortunately, that doesn't play well with our Docker config
    (where the host's IP can vary from run to run). Instead, just check for
    AJAX and DEBUG"""
    return not request.is_ajax() and bool(settings.DEBUG)
