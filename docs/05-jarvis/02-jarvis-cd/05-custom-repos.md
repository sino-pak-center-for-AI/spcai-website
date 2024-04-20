# Custom Repos

There are cases where your organization may have packages used internally and
do not want to have to wait to be integrated into the builtin repo.

## Repo structure

Custom repos have the following structure:

```
my_org_name
└── my_org_name
    └── orangefs
        └── package.py
```

## Register a custom repo

You can then register the repo as follows:

```bash
jarvis repo add /path/to/my_org_name
```

Whenever a new repo is added, it will be the first place
jarvis searches for pkgs.

## Creating pkgs from a template

You can then add pkgs to the repo as follows:

```bash
jarvis repo create [name] [pkg_class]
```

pkg_class can be one of:

- service
- app
- interceptor

For example:

```bash
jarvis repo create hermes service
```

The repo will then look as follows:

```
my_org_name
└── my_org_name
    ├── hermes
    │   └── package.py
    └── orangefs
        └── package.py
```

## Promoting a repo

Jarvis searches repos in a certain order. To make a repo the first place
that jarvis searches, run:

```bash
jarvis repo promote [repo_name]
```

## Remove a repo from consideration

Sometimes a repo needs to be removed entirely from consideration.
To do this, run:

```bash
jarvis repo remove [repo_name]
```

This will not destroy the contents of the repo, it will simply unregister
the repo from Jarvis.
