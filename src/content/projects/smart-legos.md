---
# Drafted from the SmartLEGOs README (github.com/athenafung1/SmartLEGOs). Review before publishing.
title: SmartLEGOs
summary: >-
  A Flower Collaborative Agent Hackathon proof of concept in which two smart buildings, each
  running its own federated SuperNode on synthetic sensor data, communicate with a smart-city
  agent.
tech: [Python, Flower, Docker Compose, Shell]
links:
  - { type: repository, url: https://github.com/athenafung1/SmartLEGOs }
period: September 2026
featured: true
order: 1
detail: true
detailDescription: >-
  How SmartLEGOs connects two smart buildings to a smart-city agent with Flower federated
  SuperNodes, built at the Flower AI hackathon.
---

## Problem

Smart buildings record a steady stream of occupancy and utility data, but that data usually stays
inside each building. SmartLEGOs explores how building-level data could inform a smart-city view
without first being pooled in one place.

DRAFT: in a sentence or two, say why this mattered to you and what question the team set out to
answer.

## Approach

The team modelled two buildings with different height and occupancy profiles and generated a
synthetic dataset for each: one year of time-stamped occupancy, electricity, gas and water
measurements at one-minute granularity.

Each building runs as its own Flower SuperNode with access only to its own records, and a Flower
Collaborative Agent works across both nodes in a shared federation. The nodes run in Docker
Compose and authenticate to Flower's SuperGrid with their own key pairs:

```shell
mkdir keys
for i in {0..1}; do
  ssh-keygen -t ecdsa -b 384 -N "" -C "supernode-$i" -f "keys/supernode-$i"
done
```

DRAFT: describe your own part of the build (data generation, agent setup, infrastructure …).

## Outcome

DRAFT: what the demo showed, how it was received at the hackathon, and what you would build next.
