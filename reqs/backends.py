from storages.backends.s3boto3 import S3Boto3Storage


class S3Override(S3Boto3Storage):

    def url(self, name, parameters=None, expire=None):
        print(name)
        url = super(S3Override, self).url(name, parameters=parameters,
                                          expire=expire)
        print(url)
        url = url.replace("minio:", "localhost:")
        print(url)
        return url
