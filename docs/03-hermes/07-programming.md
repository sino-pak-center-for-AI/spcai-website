# Programming

In this section, we will discuss the general steps of building a program
on top of the Hermes native API. We will focus on the core data structures
provided by Hermes -- Buckets and Blobs.

To see demonstrations of the API, check out our [API tests](https://github.com/HDFGroup/hermes/blob/master/test/unit/hermes/test_bucket.cc)

## Basic API Example

This example will place a blob into the DMSH and then retrieve that blob.

```cpp
#include <hermes.h>
#include <bucket.h>

int main() {
  TRANSPARENT_HERMES();
  Bucket bkt = HERMES->GetBucket("hello");
  size_t blob_size = KILOBYTES(4);
  Context ctx;

  std::vector<int> data_put(1024, i);
  bkt.Put<std::vector<int>>("0", data_put, ctx);

  std::vector<int> data_get(1024, i);
  bkt.Get<std::vector<int>>("0", data_get, ctx);

  REQUIRE(data_put == data_get);
}
```

- ``TRANSPARENT_HERMES()`` will initialize your connection to Hermes
- ``HERMES`` is a singleton macro provided in hermes.h.
- ``GetBucket`` will either create a bucket or get the bucket if it exists.
  This operation is concurrency-safe. I.e., it is guaranteed only one
  thread or process calling this function will create the bucket if it
  DNE.
- ``Context`` is optional. It contains the ability to override
  defaults defined in the server and client configuration files. For
  example, you can set a custom DPE to use for a blob Put.
- `hermes::Blob analagous to and std::vector<char>`. It's not quite the
  same thing, but we won't go into detail here.
- ``bkt.Put`` will put a blob into the bucket. Put replaces all content
  if the blob previously existed.
- ``bkt.Get`` will get the contents of an entire blob.
