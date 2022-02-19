# AnonCreds Specification

This repository contains the source documents for the AnonCreds open
specification. This open specification is based on the open source
implementation of AnonCreds that has been in use for the last 5 years as part of
the [Hyperledger Indy](https://www.hyperledger.org/projects/hyperledger-indy)
open source project. The extensive use of AnonCreds has made it a de facto
standard, and the AnonCreds Working Group has been established to formalize the
specification and place it on a standards track.

The draft specification can be found here: *To be added*
The source specification documents can be found here: [Specification Source](/spec).

## Background

The scope and background for this work can be found in the [Scope](2._Scope.md) in
this repository. The <tl;dr> summary is the following:

AnonCreds provides capabilities that many see as important for digital identity use cases in particular, and verifiable data in general. These features include:

- A full implementation of the Layer 3 verifiable credential “Trust Triangle” of the [Trust over IP Model](https://trustoverip.org/wp-content/toip-model/).
- Complete flows for issuing verifiable credentials (Issuer to Holder), and requesting, generating and verifying presentations of verifiable claims (Holder to Verifier).
- Fully defined data models for all of the objects in the flows, including verifiable credentials, presentation requests and presentations sourced from multiple credentials.
- Fully defined applications of cryptographic primitives.
- The use of Zero Knowledge Proofs (ZKPs) in the verifiable presentation process to enhance the privacy protections available to the holder in presenting data to verifiers, including:
  - Blinding issuer signatures to prevent correlation based on those signatures.
  - The use of unrevealed identifiers for holder binding to prevent correlation based on such identifiers.
  - The use of predicate proofs to reduce the sharing of PII and potentially correlating data, especially dates (birth, credential issuance/expiry, etc.).
  - A revocation scheme that proves a presentation is based on credentials that have not been revoked by the issuers without revealing correlatable revocation identifiers.

The AnonCreds working group is producing an AnonCreds v1.0 specification describes the existing implementation minus any dependency on the Hyperledger Indy ledger. Once
sufficient progress has been made on the v1.0 specification, a forward looking version will be started that evolves the specification to add new elements while
retaining the core features of AnonCreds (listed above). Such a future version is likely to include features such as replacing CL Signatures with BBS+ Signatures,
defining a more scalable revocation scheme, and possibly aligning the data model with the in progress W3C Verifiable Credential v2.0 Data Model. Those
participating in this Working Group will define the exact direction of future versions of the AnonCreds specification.

## Contributions

This work is being carried out under the [Community Specification License v1.0](1._Community_Specification_License-v1.md). Any person
or organization willing to adhere to this license is welcome to participate in this Working Group and contribute to the development
of the specification. Please read the [Contributions](6._Contributing.md) document in this repo for details. For those unfamiliar
with the Community Specification License, you can think of it as analogous to an open source code license, such as Apache 2.0,
but for specifications.

All participants in this working group must follow the group's [Code of Conduct](8._Code_of_Conduct.md).

## Meetings

Meetings of the Working Group are held weekly on Mondays at 7AM
Pacific/Vancouver time. That is 16:00 CET for most of the year, except for the
periods around the daylight savings time changes. Meeting details, agendas,
notes and links to the recordings are posted on the repository Wiki.

## Working Group Communications

The working group has a Slack channel for participants at: [https://anoncreds-wg.slack.com/](https://anoncreds-wg.slack.com/)
