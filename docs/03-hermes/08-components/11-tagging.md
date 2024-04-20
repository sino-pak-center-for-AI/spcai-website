# Tagging

Tags enable users to semantically define associations between blobs and provide
an intuitive way of locating blobs which are related. Tags can be used
internally by Hermes to provide enhanced data placement decisions based on the
logical grouping of data. Operations (known as Traits) can be associated with
tags to define a set of operations to perform based.

## The tagging API

The tag API supports the ability to tag and untag a blob. There are two general
use cases of tags: locating related blobs, and defining a set of operations to
perform on a blob. In the below example, we show how to use tags to locate
blobs. We discuss the use of tagging for operating on blobs through the use of
Traits.

```cpp
int main() {
  size_t blob_size = KILOBYTES(4);
  hermes::api::Context ctx;
  BlobId blob_id[2];

  auto bkt1 = HERMES->GetBucket("hello1");
  auto bkt2 = HERMES->GetBucket("hello2");

  Blob blob(blob_size);
  bkt1->Put("1", blob, blob_id[0], ctx);
  bkt2->Put("2", blob, blob_id[1], ctx);

  TagId tag = HERMES->CreateTag("equivalent");
  bkt1->TagBlob(blob_id[0], tag);
  bkt2->TagBlob(blob_id[1], tag);
  std::vector<BlobId> tags = HERMES->GroupBy(tag);
  REQUIRE(tags.size() == 2);
}
```

In this example, we create two buckets and one blob (of size 4KB) in each
bucket. Both blobs have the same value. We create the tag "equivalent" to
indicate that blobs with this tag are all equal. Note, the name of the tag is
only relevant to the user, and has no internal meaning to Hermes itself. Hermes
does not know the blobs are equivalent.

Next, we tag the two blobs, which are in separate buckets, with the "equivalent"
tag. We then group all blobs which have the tag. We verify that the number of
blobs apart of this tag is two and then return.
