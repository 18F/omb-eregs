import argparse
import json
import sys


def convert(input_json, prefix):
    for source_file in input_json.get('source_files', []):
        source_file['name'] = prefix + source_file.get('name', '')


parser = argparse.ArgumentParser(
    description="Add a prefix path to all CodeClimate coverage files")
parser.add_argument('CC_JSON_FILE', nargs='?', type=argparse.FileType('rb'),
                    default=sys.stdin)
parser.add_argument('--prefix', required=True)


if __name__ == '__main__':
    args = parser.parse_args()
    input_json = json.load(args.CC_JSON_FILE)
    convert(input_json, args.prefix)
    print(json.dumps(input_json))    # noqa - correct behavior

