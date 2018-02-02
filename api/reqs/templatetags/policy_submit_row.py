from django import template
from django.contrib.admin.templatetags.admin_modify import \
    submit_row as original_submit_row

register = template.Library()


@register.inclusion_tag('reqs/admin/submit_line.html', takes_context=True)
def submit_row(context):
    """Identical to admin_modify's submit_row, save that we use a different
    template and add an extra context value."""
    context = original_submit_row(context)
    # Extension point for future permissions checks, if desired
    context['show_save_then_doc'] = True
    return original_submit_row(context)
