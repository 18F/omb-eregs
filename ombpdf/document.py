from . import fontsize
from . import util


class OMBDocument:
    def __init__(self, ltpages):
        stats = fontsize.get_font_size_stats(ltpages)
        self.paragraph_fontsize = stats.most_common(1)[0][0]
        self.ltpages = ltpages

    def iter_flattened(self, class_filter=object):
        return util.iter_flattened_layout(self.ltpages, class_filter)

    @classmethod
    def from_file(cls, fp):
        return cls(util.get_ltpages(fp))
