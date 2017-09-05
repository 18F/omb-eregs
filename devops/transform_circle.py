import argparse

import yaml


def convert(compose_config, container_name):
    for service in compose_config.get('services', {}).values():
        if 'volumes' in service:
            service['volumes_from'] = [f'container:{container_name}']
            del service['volumes']


parser = argparse.ArgumentParser(
    description="Transform docker-compose yaml to CircleCI-compatible files")
parser.add_argument('compose_yaml', type=argparse.FileType('rb'))
parser.add_argument('container_name')


if __name__ == '__main__':
    args = parser.parse_args()
    compose_config = yaml.safe_load(args.compose_yaml)
    convert(compose_config, args.container_name)
    print(yaml.dump(compose_config))    # noqa - correct behavior
