---
title: Introduction
---

## Synopsis

This project will design and implement ChronoLog, a distributed and tiered shared log storage ecosystem. ChronoLog uses physical time to distribute log entries while providing total log ordering. It also utilizes multiple storage tiers to elastically scale the log capacity (i.e., auto-tiering). ChronoLog will serve as a foundation for developing scalable new plugins, including a SQL-like query engine for log data, a streaming processor leveraging the time-based data distribution, a log-based key-value store, and a log-based TensorFlow module.

## Components

- `ChronoVisor`: first contact for client applications, manages the global time, orchestrates `ChronoKeeper`s, metadata management
- `ChronoKeeper`: high-performance indexed distributed journal to handle two major operations: append and playback
- `ChronoStore`: multi-tiered storage system to absorb data flush from `ChronoKeeper` and process historic read
- `ChronoGrapher`: flushes data from `ChronoKeeper` to `ChronoStore`
- `ChronoPlayer`: handles the third operation replay
