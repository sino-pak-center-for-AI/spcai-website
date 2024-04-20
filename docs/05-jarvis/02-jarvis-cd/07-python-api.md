# Python API

This guide documents how to use Jarvis within a Python script. To this point,
we have demonstrated the Jarvis CLI. However, the Python API can be used
for building more complex benchmarks.

## Importing Jarvis CD

```python
from jarvis_cd.basic.pkg import Pipeline
```

## Creating a Pipeline

To create a pipeline and save the environment for the pipeline:

USAGE:

```python
pipeline = Pipeline().create(pipeline_id).build_env().save()
```

For example:

```python
pipeline = Pipeline().create('gs-hermes').build_env().save()
```

NOTE: `create()` will not override any data if the pipeline already exists.

## Loading an Existing Pipeline

USAGE:

```python
pipeline = Pipeline().load(pipeline_id=None)
```

The following will load the currently-focused pipeline:

```python
pipeline = Pipeline().load()
```

The following will load the pipeline with a particular name

```python
pipeline = Pipeline().load('gs-hermes')
```

## Append Pkgs to a Pipeline

USAGE:

```python
pipeline.append(pkg_type, pkg_id=None, do_configure=True, **kwargs)
"""
Create and append a pkg to the pipeline

:param pkg_type: The type of pkg to create (e.g., OrangeFS)
:param pkg_id: Semantic name of the pkg to create
:param do_configure: Whether to configure while appending
:param kwargs: Any parameters the user want to configure in the pkg
:return: self
"""
```

The following will add Hermes to the pipeline with a sleep of 10

```python
pipeline.append('hermes', 'sleep'=10)
pipeline.append('hermes_mpiio')
pipeline.append('gray_scott')
pipeline.save()
```

## Configure a `Pkg` in the Pipeline

USAGE:

```python
pkg = pipeline.get_pkg(pkg_id)
pkg.configure(**kwargs)
```

For example:

```python
pkg = pipline.get_pkg('hermes')
pkg.configure(sleep=5).save()
```

## Unlink/Remove `Pkg`s from a Pipeline

Unlink will simply remove the program from the Jarvis config, but not
destroy its contents. Unlinked pkgs can be re-linked using append without
losing the configuration data.

Remove ereases the pkg from the filesystem entirely.

USAGE:

```python
pipeline.remove(pkg_id).save()
pipeline.unlink(pkg_id).save()
```

For example:

```python
pipeline.remove('hermes').save()
```

## Run a Pipeline

To run the Pipeline end-to-end:

```python
pipeline.run()
```

## Destroy a Pipeline

To destroy a Pipeline:

```python
pipeline.destroy()
```
