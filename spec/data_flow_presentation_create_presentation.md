### Generate Presentation

In step 3, 4, and 5 of the [AnonCreds Presentation Data
Flow](#anoncreds-presentation-data-flow), the [[ref: holder]] collects the required
information to create the verifiable presentation according to the
[presentation request](#example-of-a-complete-presentation-request) received
from the [[ref: verifier]].

Each attribute and predicate in the presentation request must be satisfied by a
source credential held by the [[ref: holder]] that meets the associated
`restrictions` item in the presentation request. The same source credential MAY
be used to satisfy multiple attributes and predicates. Each attribute in the
presentation request may specify (using the `names` item) that multiple [[ref:
claims]] from the source credential must be shared. If there is no `restrictions` item
in the presentation request, the [[ref: holder]] MAY satisfy the presentation request
with self-attested attributes.

::: note

To prevent confusion, the term "attribute" in this section **always** refers to
the `required_attributes` in a presentation request, and the term "claim" is
used for the data elements in a verifiable credential.

:::

The [[ref: verifier]] may specify in the presentation request that if some or
all of the attributes/predicates are to be satisfied by revocable credentials,
the [[ref: holder]] must accompany the verifiable credential proofs with
non-revocation proofs (NRPs) for the source credentials. The generation of NRPs
is described [in the generate non-revocation proofs
section](#generate-non-revocation-proofs) of the specification.

::: note

Often in discussions about verifiable presentations, the term "[[ref: prover]]"
is used to indicate the participant generating the presentation. Throughout the
Hyperledger AnonCreds implementation the term `prover` is used in the names of
methods performed by that participant. However, because in AnonCreds the [[ref:
holder]] and the [[ref: prover]] are always the same entity, we'll use [[ref:
holder]] to refer to the participant generating the requested presentation to
emphasize that the same entity is both issued credentials and generating
presentations from those credentials.

:::

#### Collecting the Source Verifiable Credential Data

Before the [[ref: holder]] can generate the presentation to satisfy a request,
the source verifiable credentials that will be used in the presentation must be
collected.

The source verifiable credentials found for use in generating a presentation
must meet the following requirements:

- All of the source credentials MUST have been issued to the same link secret.
- The source credential for each presentation request attribute and predicate
  must satisfy the attribute's or predicate's associated `restrictions` item,
  and must include claim names that match the attribute's `name` or `names`
  item, or claim name that match the requested predicate.

The mechanism to find the credentials in the holder's wallet that satisfy a
presentation request is outside the scope of this specification. As such, the
remainder of this section covering how this process is done in Hyperledger Aries
implementations is non-normative.

Aries implementations have historically used a mechanism called [Wallet Query
Language] (WQL) to find the source credentials in the [[ref: holder]] agent's
storage. Agents iterate through the presentation request attributes and
predicates, converting the `restrictions` item from each into a corresponding
WQL query, and calling an Aries key management service, such as [Aries Askar],
to return the credentials in the wallet that satisfy the query.

[Wallet Query Language]: https://github.com/hyperledger/aries-rfcs/tree/main/concepts/0050-wallets#wallet-query-language
[Aries Askar]: https://github.com/hyperledger/aries-askar

Completing the process results in a list of 0 or more source verifiable
credentials that satisfy each attribute and predicate. If there is not a source
verifiable credential for each, a business process must be invoked to decide if
or how to proceed. For example, if some of the attributes or predicates cannot
be satisfied with a credential already in the [[ref: holder]]'s storage, a
process to get the necessary additional verifiable credentials may be initiated.
If more than one verifiable credential satisfy any of the `restrictions` items,
the [[ref: holder]] software might select one to use by default, such as the
most recently issued, non-revoked of the credentials, and/or might invoke a user
interface to allow the entity that controls the [[def:holder]] software to
select from the set of possible credentials to use.

In order to proceed to the presentation generation step, there must be one
credential selected for each attribute and predicate in the presentation
request.

#### Prepare Inputs to Presentation Generator

The next step of the process to create a presentation is to prepare the inputs
to a call to AnonCreds to generate the presentation. The following are the
inputs to the generation process
([implementation](https://docs.rs/indy-credx/latest/indy_credx/prover/fn.create_presentation.html)).
The holder must prepare each of the inputs by getting data either from local
storage or, in the case of public data, retrieving it from the appropriate
verifiable data registry(ies). AnonCreds implementations may provide functions
to help in preparing some of the data.

- `pres_req` -- The presentation request from the [[ref: verifier]].
- `credentials` -- The list of credentials chosen by the holder for use in the presentation, including the request attributes and predicates to be populated from the each of the credentials. See note below.
- `self_attested` - A Hash Map containing each attribute to be satisfied with a self-attested response. Each entry includes the name of a presentation request attribute, and the self-attested value for that attribute.
- `link_secret` - The link secret for the credentials in the presentation.
- `schemas_json` - A Hash Map containing the `SchemaId` and complete `Schema` for the
  schemas of the credentials in the presentation.
- `credential_defs_json` - A Hash Map containing the `CredentialDefinitionId`
  and the complete `CredentialDefinition` for the credential definitions of the
  credentials in the presentation. Included in the `CredentialDefintion` are the
  revocation related values of the `CredentialDefinition`.

The `credentials` data structure contains for each listed credential:

- The complete `credential` data structure, as received from the [[ref:
  issuer]].
- A list of the presentation request attributes and predicates that will be
  populated from the credential.
  - For each of the source credential claim to be included in a request
    attribute, an indicator if the credential is to be revealed or not
    (`true`/`false`) in the presentation.
- The `timestamp` for the selected [[ref: RevRegEntry]] that will be used to
  produce the non-revocation proof, if required.
- The `witness` for the credential based on the [[ref: RevRegEntry]] being used
  to produce the non-revocation proof, if needed.

If the credential is not revocable, the latter two inputs are `null`, and are
not used. See the later section on [generating a presentation for a revocable
credential](#non-revocation-proof-generation-steps) for details about populating
the `timestamp` and `witness` data elements.

The indicator of whether a claim is to be revealed or not in AnonCreds 1.0 must
be carefully understood by verifiers. While a verifer requests a set of claims
from the prover, the prover may choose to not reveal the `raw` value of some of
those claims. If the prover does not reveal all of the requested claims,
**AnonCreds treats the presentation as cryptographically verified**. It is then
up to the verifier to decide, after cryptographic verification, if a
presentation with unrevealed values is acceptable for the business purpose of
the presentation.

#### Generate the Presentation

From the inputs, the presentation data is generated and put into the following
data structure:

- `presentation_request` -- The presentation request from the verifier.
- `presentation` -- The set of proofs generated to satisfy the presentation
  request, including:
  - For each source credential, a primary `eq_proof` of the issuer signature
  across all of the claims in the credentials.
  - For each source credential that is revocable and for which the verifier
    has requested proof of non-revocation, a non-revocation proof, `non_revoc_proof`.
    - See the specification section on [non-revocation-proof
generation](#non-revocation-proof-generation-steps) for details on this data
structure.
  - For each requested predicate, a primary `ge_proof` (predicate) proof based
  on the requested claim from a source credential, the boolean operator (one of
  `<=, <, >, >=`), and the comparison value in the presentation request
  predicate.
  - One aggregate proof, `aggregated_proof`, across all of the source credentials
  that proves that the same link secret was used in the issuance of all of the
  credentials.
  - The mapping from each of the requested attributes and predicates to the
  primary proofs that satisfies the request.
    - A mapping for the requested attributes of the `raw` and
    `encoded` values from each revealed source credential claim.
    - A list of the self-attested attributes provided for the requested
      attributes that permit self-attested attributes.
    - A list of the unrevealed attributes.
    - A mapping of the requested predicates to the `ge_proof` that satisfies the
      request.
  - An array `identifiers` containing the `schemaId` and `credDefId` for each
  source credential in the presentation.
    - Also included for each source credentials for which a non-revocation proof
      is provided is the `revRegDefId` and the `timestamp` of the [[ref:
      Revocation Registry Entry]] used in the non-revocation proof.

The following is an example of a multi-credential presentation without
revocation.

::: todo
Replace this example with one that includes:

- two request attributes
- one predicate request
- one unrevealed attribute
- one self-attested attribute

:::

::: example Multi-Credential Presentation
```json
[[insert: ./data/MutiCredentialPresentation.json ]]
```
:::

Once the presentation data structure is generated, it is sent to the verifier
for processing.

The following describes the data structures listed above, including the
process of generating the data of the various types of proofs.

**The Presentation Request**

The `presentation_request` is a copy of the `presentation_request` data structure from
the verifier, as described [earlier in the specification](#the-presentation-request).

**Presentation**

The `presentation` contains:

- Proofs of the source credentials.
- An aggregated proof across all of the source credentials.
- A mapping of how the requested attributes and predicates are satisfied.
- A list of the identifiers related to each of the source credentials in the
  proof.

The `presentation` data structure is as follows. As noted in the JSON comments
included, details for each section of the `presentation` is provided below.

```json
  "presentation": {
    "proof": {
      "proofs": [
        {
          "primary_proof": {
            "eq_proof": {
              # Described in detail below
            },
            "ge_proofs": [
              # Described in detail below
            ]
          }
        }
      ],
      "aggregated_proof": {
        # Described in detail below
      }
    },
    "requested_proof": {
      # Described in detail below
    }
    "identifiers": {
      # Described in details below
    }
  }
```

The `proofs` array contains an entry for each source verifiable credential.
For each is a `primary_proof` covering the claims in the source credential called
the `eq_proof`, and a `ge_proof` for each of the predicate proofs sourced from
the verifiable credential.

Each primary `eq_proof` is generated as follows:

::: todo

To Do: Add algorithm for generating a `eq_proof` and the data values in the proof.

:::

Each primary `ge_proof` is generated as follows:

::: todo

To Do: Add algorithm for generating a `ge_proof` and the data values in the proof.

:::

The `aggregated_proof` proves that the same [[ref: linked secret]] was used to
issue all of the source verifiable credentials in the presentation.

The `aggregated_proof` is generated as follows:

::: todo

To Do: Add algorithm for generating the aggregate proof and the data values in the proof.

:::

The `requested_proof` is the mapping from the presentation request attributes
and predicates to the data in the presentation that satisfies the request. This
is divided into five parts:

- The request attributes, where a single attribute `name` is requested.
- The request attribute groups, where a set of `names` are requested from a single source credential.
- Request attributes without `restrictions` that are satisfied with self attested attributes.
- Request attributes that are unrevealed.
- Request predicates.

A JSON summary, with comments, for the data in each of the parts is listed below:

**Revealed Attributes**

An entry for each single `name` request attribute from the presentation request.

```json
      "revealed_attrs": {
        "consent_attrs": {      # The request attribute name from the presentation request
          "sub_proof_index": 1, # The index of the source credential primary proof for the claim
          "raw": "205b1ea0-7848-48d4-b52b-339122d84f62",  # The raw and encoded claim values
          "encoded": "46414468020333259158238797309781111434265856695713363124410805958145233348633"
        }
      }
```

::: note

It is important for all verifiers to understand that the revealed attribute
proof (`eq_proof` described earlier) is a proof on the `encoded` value, not on
the `raw` value. As such, it is up to the verifier to know the "raw to encoded"
algorithm used by the issuer, and to verify that the revealed `raw` value properly
encodes to the proven `encoded` value. It is possible for a malicious holder to
put an unrelated `raw` value into a presentation to fool a verifier that does not
checking the encoding process. In most Aries implementations, the encoding is checked
by the Aries framework, as a "post-cryptographic verification" step.

A future version of the AnonCreds specification is likely to do an "on the fly"
encoding in AnonCreds rather than including both values in the source
credentials and presentations. This would prevent the holder from replacing the
`raw` value without detection.

:::

**Revealed Attribute Groups**

An entry for each group `names` request attribute from the presentation request.

```json
      "revealed_attrs": {
        "consent_attrs": {      # The request attribute name from the presentation request
          "sub_proof_index": 1, # The index of the source credential primary proof for the claims
          "values": {           # An entry for the each of the names in the request attribute group
            "claim_name": {     # The name of the claim, its raw and encoded value
              "raw": "205b1ea0-7848-48d4-b52b-339122d84f62",
              "encoded": "46414468020333259158238797309781111434265856695713363124410805958145233348633"
            }
          }
        }
      }
```

**Self Attested Attributes**

This is a set any other data that [[ref: holder]] wants to provide to the [[ref: verifier]] that is not signed by any issuer thus it’s attested only by the holder. This is a set of attributes that the holder is attesting to the verifier. The holder is not claiming that the data is true, only that they are attesting to it.

```json
      "self_attested_attrs": {
        "consent_attrs": "I agree to share my data with the verifier"
      }
```

**Unrevealed Attributes**

These are a hashmap of unrevealed attributes that the verifier requested in the presentation request, but the holder has decided not to reveal, along  with their sub proof index numbers. The [[ref: verifier]] can use the sub proof index numbers to retrieve the
corresponding primary proof from the `proof` array in the presentation.

```json
      "unrevealed_attrs": {
        "consent_attrs": {      # The request attribute name from the presentation request
          "sub_proof_index": 1  # The index of the source credential primary proof for the claim
        }
      }
```

**Predicates**

An entry for each predicate request from the presentation request.

```json
      "predicates": {
        "consent_attrs": {      # The request predicate name from the presentation request
          "sub_proof_index": 1, # The index of the source credential primary proof for the claim
        }
      }
```

**Identifiers**

The `identifiers` contains a list of the identifiers to be resolved by the
verifier to retrieve the cryptographic material necessary to verify each of the
proofs in the presentation. The identifiers are listed in an array with one
entry per source verifiable credential, ordered by the `proofs` list earlier in
the presentation.

The data structure is:

``` json
    "identifiers": [
      {
        "schema_id": "CsQY9MGeD3CQP4EyuVFo5m:2:MYCO Biomarker:0.0.3",
        "cred_def_id": "CsQY9MGeD3CQP4EyuVFo5m:3:CL:14951:MYCO_Biomarker",
      }
    ]
```

The example above is for a source credential that is not revocable. For a
revocable source credential, the `rev_reg_id` and `timestamp` (the identifier
for the [[def: Revocation Registry Entry]] used in the non-revocation proof) are
added. Those are described in the section below on [generation of non-revocation
proofs](#generate-non-revocation-proofs)

#### Generate Non-Revocation Proofs

A [[ref: holder]] preparing an AnonCreds presentation must determine what, if
any, non-revocation proofs (NRPs) must be included the presentation based on a
combination of what is in the proof request and what verifiable credentials are
to be used in the presentation. As noted in the [section on revocation in the
presentation request]((#verifier-revocation-interval-request)), the presentation
request may have the `non-revoked` item at the outer-most level, applying to all
source credentials, or at the `requested_attribute` and/or `requested_predicate`
level, applying only to specific source credentials. Further, the [[ref:
holder]] must determine if the source verifiable credential for the requested
attributes/predicates where a NRP is requested is a revocable credential.
Obviously, an NRP cannot be produced for a verifiable credential issued without
that does not support revocation. Where a revocation interval is specified in
the request, and where the source credential to satisfy the request is
revocable, the holder must provide a non-revocation proof.

Once the [[ref: holder]] has determined the which source credentials will
required an accompanying NRPs in the presentation, the [[ref: holder]] must
collect and prepare the necessary proof generation inputs.

#### Collecting Data for Generating the Non-Revocation Proof

Recall from the earlier section on [preparing inputs to the presentation generation
process](#prepare-inputs-to-presentation-generator) that for each revocable
source credential, the holder must provide the following data elements:

- `witness` -- A single value calculated from the [[ref: Revocation Registry
  Entry]] used by the holder to create the non-revocation proof.
- `timestamp` -- The `timestamp` of the [[ref: Revocation Registry Entry]] used
by the holder to create the non-revocation proof. `timestamp` is an attribute of
the [[ref: Revocation Registry Entry]] that allows the verifier to uniquely
identify the [[ref: Revocation Registry Entry]] used by the holder. The
`timestamp` must meet the `non_revocation_interval` requirements specified in
the presentation request.

The `witness` is an integer that is used in the non-revocation zero
knowledge proof to demonstrate to the verifier that the holder's credential has
not been revoked. Recall that the `accumulator` of a [[def: Revocation Registry
State]] is the product of the tails file entries for all of the unrevoked
credentials in the registry. For a specific holder, its `witness` is the product
of the tails file entries for all of the unrevoked credentials in the registry
**except for the holder's own credential**. Obviously, if the witness equals the
accumulator, the holder's credential has been revoked. But, if not, then a valid
non-revocation proof demonstrates that the `witness` times the entry from the tails
file for the holder's credential equals the accumulator, without revealing
either the `witness`, the credential's index, or its tails file entry.

An AnonCreds process is used to calculate the `witness` value, takes the
following inputs:

- `tails_reader` -- A reference to a local copy of the [[ref: Tails File]] for
  the Revocation Registry for reading.
- `revoc_reg_def` -- The Revocation Registry Definition, as retrieved from the
  [[ref: Verifiable Data Registry]] to which the issuer published it.
- `rev_status_list` -- A data structure about the [[ref: Revocation Registry
  Entry]] to be used for creating the non-revocation proof. It includes:
   - `rev_reg_def_id` -- the ID of the [[ref: Revocation Registry Definition]].
   - `issuer_id` -- the ID of the issuer of the source credential and hence, the
   [[ref: Revocation Registry Definition]].
   - `revocation_list` -- a bit vector containing the status (`revoked`,
  `not revoked`) of all of the credentials in the revocation registry
   - `accum` -- the value of the accumulator from the [[ref: Revocation Registry
     Entry]] to be used for creating the non-revocation proof.
   - `timestamp` -- the value of the timestamp from the [[ref: Revocation Registry
     Entry]] to be used for creating the non-revocation proof.
- `rev_reg_idx` -- The index in the revocation registry of the holder's
  credential. This is the credentials for which 
- `rev_state`: An optional, previous `witness` that can be updated to produce
  the new `witness` output.
- `old_rev_status_list` -- An optional, previous `rev_status_list` (described
  above) that was in place at the time the previous witness was generated.

The holder must use the `from` and `to` timestamp revocation interval
requirements from the presentation request and knowledge of the [[ref:
Revocation Registry Entries]] to determine which [[ref: Revocation Registry
Entry]] to retrieve and use in generating the NRP for a given credential. The
selected [[ref: Revocation Registry Entry]] must either have been active at the
time of the `from` value or have been published by the issuer between the `from`
and `to` values. How to determine an appropriate [[ref: Revocation Registry
Entry]] to use is up to the holder, and their use of the capabilities of the
relevant [[ref: Verifiable Data Registry]].

::: note

When Hyperledger Indy is the [[ref: Verifiable Data Registry]] for the [[ref:
Revocation Registry Entry]], the state is received from Indy ledger as the
"deltas" (state changes) from either the initial state of the Registry or from a
previous [[ref: Revocation Registry Entry]]. While the older Indy version of
AnonCreds used the "deltas" representation directly, the newer AnonCreds version
requires that the holder software convert the Indy "deltas" format into the
`rev_status_list` representation, with every credential in the registry is given
a `revoked` or `not revoked` boolean value.

The benefit of the "full state" representation for [[ref: Revocation Registry
Entries]] is that the [[ref: :Verifiable Data Registry]] can be "dumb",
returning the same static file given to it by the Issuer. With the Indy "deltas"
approach, the [[Verifiable Data Registry (VDR)]] must be an active service
returning an on-the-fly calculated result based on the inputs of the holder's
request.

:::

In collecting the `revocation_list` data in the `rev_status_list`, the holder
may discover that their credential has been revoked by the issuer. The holder
may choose at that point to stop the presentation process. If the holder decides
to proceed, they will not be able to create a valid non-revocation proof for the
source credential.

The output of the process is the new `witness` for a credential that will be
used as input to the generate presentation process.

##### Non-Revocation Proof Generation Steps

Given the data collected by the [[ref: holder]] to produce the NRP, the
following calculations are performed.

Once the witness (`u`), the accumulator from the ledger (`e`) and the value of
the tails file entry for the credential of interest (`b`) are known, the NRP can
be generated as follows:

::: todo

To Do: Add more detail about the calculation of `C`<sub>`u`</sub> and
`C`<sub>`b`</sub> in the following.

:::

- The [[ref: holder]] calculates `u*b = e`, where e is the accumulator.
- The [[ref: holder]] derives two values (in cryptograhic terms -
  [commitments](https://en.wikipedia.org/wiki/Commitment_scheme))
  `C`<sub>`u`</sub> and `C`<sub>`b`</sub> based on `u` and `b`.
- The [[ref: holder]] then calculates `T` from `C`<sub>`u`</sub> and
  `C`<sub>`b`</sub> and sends all three to the [[ref: verifier]].
- The [[ref: verifier]] uses `e` (the accumulator from the ledger),
  `C`<sub>`u`</sub> and `C`<sub>`b`</sub> to calculate its own `T'` and confirms
  that `T` and `T'` are the same.

This is the zero knowledge non-revocation proof.

Each NRP is added alongside the credential to which the NRP is applied, to the
presentation generated by the [[ref: holder]] using this data
model:

```json
"non_revoc_proof": {
    "x_list": {
        "rho": "...",
        "r": "...",
        "r_prime": "...",
        "r_prime_prime": "...",
        "r_prime_prime_prime": "...",
        "o": "...",
        "o_prime": "...",
        "m": "...",
        "m_prime": "...",
        "t": "...",
        "t_prime": "...",
        "m2": "...",
        "s": "...",
        "c": "..."
    },
    "c_list": {
        "e": "...",
        "d": "...",
        "a": "...",
        "g": "...",
        "w": "...",
        "s": "...",
        "u": "..."
    }
}
```

The values in the data model are:

:::todo
To Do: Enumerate each of the items in each NRP section of the presentation.
:::

- `x_list`" is ...
  - `rho`" is ...
  - `r`" is ...
  - `r_prime`" is ...
  - `r_prime_prime`" is ...
  - `r_prime_prime_prime`" is ...
  - `o`" is ...
  - `o_prime`" is ...
  - `m`" is ...
  - `m_prime`" is ...
  - `t`" is ...
  - `t_prime`" is ...
  - `m2`" is ...
  - `s`" is ...
  - `c`" is ...
- `c_list`" is ...
  - `e`" is ...
  - `d`" is ...
  - `a`" is ...
  - `g`" is ...
  - `w`" is ...
  - `s`" is ...
  - `u`" is ...

As well, in the presentation data model, added to the `identifiers` item, is the
timestamp (Unix epoch format) of the [[ref: RevRegEntry]] used to construct the NRP
(see example below). The [[ref: verifier]] needs the `rev_reg_id` and `timestamp` to get
the correct accumulator to use in verifying the NRP.

```json
"identifiers": [
    {
        "schema_id": "7BPMqYgYLQni258J8JPS8K:2:degree schema:46.58.87",
        "cred_def_id": "7BPMqYgYLQni258J8JPS8K:3:CL:70:faber.agent.degree_schema",
        "rev_reg_id": "7BPMqYgYLQni258J8JPS8K:4:7BPMqYgYLQni258J8JPS8K:3:CL:70:faber.agent.degree_schema:CL_ACCUM:61d5a381-30be-4120-9307-b150b49c203c",
        "timestamp": 1656269796
    }
]
```

In step 6 of the [AnonCreds Presentation Data
Flow](#anoncreds-presentation-data-flow), the [[ref: holder]] sends the verifiable
presentation, including any embedded NRPs, to the [[ref: verifier]].

[Link: indy-anoncreds/docs/dev/anoncred.pdf](indy-anoncreds/docs/dev/anoncred.pdf)
