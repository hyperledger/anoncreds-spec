### AnonCreds Revocation Data Flow

AnonCreds includes a mechanism that supports the revocation of verifiable
credentials. This mechanism includes:

- An [[ref: issuer]] setting up to issue revocable credentials.
- An [[ref: issuer]] issuing revocable credentials.
- An [[ref: issuer]] revoking issued credentials.
- A [[ref: verifier]] requesting a presentation to include a proof of non-revocation
  for one or more revocable credentials.
- A [[ref: holder]] generating based on the request of the verifier a proof of
  non-revocation for attributes derived from revocable credentials.
- A [[ref: verifier]] verifying a proof of non-revocation included in a
  presentation from a [[ref: holder]].

A fundamental goal of AnonCreds is to not provide a correlatable identifier for
a either a [[ref: holder]] or a credential as part of generation and verification of an AnonCreds
presentation. Applying that goal to revocation means that the revocation
mechanism must support the [[ref: holder]] proving a credential used in generating a
presentation is not revoked without providing a correlatable identifier for that
credential. As such, the AnonCreds revocation mechanism uses a Zero Knowledge
Proof (ZKP) that allows the [[ref: holder]] to prove a credential they hold is not
revoked without revealing an identifier for their credential.

#### AnonCreds Issuer Setup With Revocation

The details of [[ref: issuer]] setting up revokable credential types are covered
in the [issuer
setup](data_flow_setup.md#generating-a-creddef-with-revocation-support) section
of this specification.

#### AnonCreds Issuance with Revocation

The details of an [[ref: issuer]] issuing a revokable credential to a [[ref:
holder]] are covered in the [issuance data
flow](data_flow_issuance.md#issue-credential) section of this specification.

If the [[ref: issuer]] has created the [[ref: RevReg]] from which they are
issuing credentials to have an `ISSUANCE_TYPE` of `ISSUE_ON_DEMAND`, the
[[ref:issuer]] must publish a [[ref: RevRegEntry]] (as described in the next
section) as each credential issued. Based on the experience of the AnonCreds
community in the use of revocable credentials, it is highly recommended the
`ISSUE_ON_DEMAND` approach **NOT** be used unless absolutely required by your
use case. The reason for this recommendation is that `ISSUE_ON_DEMAND` requires
near real-time activation, meaning the issuing of each credential requires the
publication of a new [[ref: RevRegEntry]], resulting in many [[ref:
RevRegEntry]] transactions being performed, one per credential issued. As such,
we would like to deprecate or even remove the `ISSUE_ON_DEMAND` approach in the
next version of AnonCreds revocation. Feedback from the community on this would
be appreciated. We are particularly interested in understanding what use cases
there are for `ISSUE_ON_DEMAND`.

#### AnonCreds Credential Revocation and Publication

When an [[ref: issuer]] decides to revoke a previously issued credential (or
activate a previously inactive/revoked credential), they do so by publishing
another instance of the [[ref: RevRegEntry]] object. Recall from the issuer
setup section, the specification about [creating and publishing the first [[ref:
RevRegEntry]]](data_flow_setup.md#creating-the-initial-revocation-registry-entry-object)
for a [[ref: RevReg]]. In that process, the accumulator for the initial state of
the [[ref: RevReg]] is published. When subsequent [[ref: RevRegEntry]]
transactions are published to the ledger, each includes an updated value of the
accumulator, along with lists of the identifiers of the credentials that have
had their revocation state toggled -- either changed to issued, or changed to
revoked -- since the last [[ref: RevRegEntry]] was published. An example of the
data in the [[ref: RevRegEntry]] is shown in the following example of a [[ref:
RevRegEntry]], pulled from [this transaction on the Sovrin
MainNet](https://indyscan.io/tx/SOVRIN_MAINNET/domain/140326).

``` json
"data": {
    "revocDefType": "CL_ACCUM",
    "revocRegDefId": "4xE68b6S5VRFrKMMG1U95M:4:4xE68b6S5VRFrKMMG1U95M:3:CL:59232:default:CL_ACCUM:4ae1cc6c-f6bd-486c-8057-88f2ce74e960",
    "value": {
        "accum": "21 116...567",
        "prevAccum": "21 128...C3B",
        "issued": [
        ],
        "revoked": [
            172
        ]
    }
},
```

In the above:

- `revocDefType`: is defined by the comparable entry in the [[ref: RevReg]], and for this
  version of AnonCreds is hard-coded to `CL_ACCUM`.
- `revocRegDefId`: is the Id of the [[ref: RevReg]] to which this entry is
  being added.
- `accum`: is the new value of the accumulator based on the state of the
  credentials in the [[ref: RevReg]], including those listed in this transaction. The
  value is calculated by the Issuer based on the credential state changes, and
  submitted as part of the transaction, and verified by the ledger before being
  published.
- `prevAccum`: is the previous value of the accumulator. The value is supplied
  by the Issuer in the transaction request, and verified by the ledger before
  being published.
- `issued`: an array (possibly empty or not supplied) of the indices within the
  [[ref: RevReg]] of the credentials whose state has changed to `active` (also known as
  `not revoked`) since the last [[ref: RevRegEntry]] was published to the ledger.
- `revoked`: an array (possibly empty or not supplied) of the indices within the
  [[ref: RevReg]] of the credentials whose state has changed to `revoked` (also known as
  `not active`) since the last [[ref: RevRegEntry]] was published to the ledger.

In the example transaction above no credentials are `issued` (meaning changed
from status `revoked` to `issued`) and only one, the credential with index
`172`, is changed to `revoked`. Both lists can have an arbitrary number of
entries, up to the total number of credentials in the [[ref: RevReg]].

The algorithm to calculate the value of a [[ref: RevRegEntry]] accumulator at
any time is the same: determine the (modulo) product of the primes for each
non-revoked credential in the [[ref: REV_REG]], as described
[here](data_flow_setup.md#creating-the-initial-revocation-registry-entry-object).

A [[ref: VDR]] publishing the [[ref: RevRegEntry]] transactions MAY perform its own calculation
of the accumulator to ensure that the calculation of the accumulator after all
of the revocation status updates to the credentials within the [[ref: RevReg]] have been
applied, rejecting the transaction if the calculated accumulator does not match that from the [[ref: issuer]].

The [[ref: issuer]] MUST track of the revocation status of all of the credentials
within a [[ref: RevReg]] so that it can both calculate the correct accumulator and send
to the [[ref: VDR]] accurate lists (`issued` and `revoked`) of the indices of the
credentials whose status has changed since the last [[ref: RevRegEntry]] was published.
If the [[ref: issuer]] and [[ref: VDR]] get out of sync about the status of
credentials in the [[ref: RevReg]], such that the two cannot agree on the current value
of the accumulator, the [[ref:issuer]] must rationalize the differences and
produce a [[ref: RevRegEntry]] transaction that accounts for both the last published
[[ref: RevRegEntry]] published in the [[ref: VDR]] and the desired revocation status of all of the
credentials in the [[ref: RevReg]].

Note that the [[ref: holder]] is not involved in the credential revocation
process. There is no technical requirement for an [[ref: issuer]] to notify the
[[ref: holder]] that a credential they were issued has been revoked. That said, it is a
courtesy that may improve the user experience of the [[ref: holder]]. [Aries RFC 0183
Revocation
Notification](https://github.com/hyperledger/aries-rfcs/tree/main/features/0183-revocation-notification)
is an example of how that can be done. Even if not notified by the [[ref:
issuer]] of the revocation of a credential, the [[ref: holder]] can detect their
credential has been revoked when they retrieve the list of revoked credentials
from the [[ref: VDR]] and discover the index of their credential in the list.

#### AnonCreds Presentation with Revocation

Creating an AnonCreds presentation is a two-step process, beginning with a
request from the [[ref: verifier]] asking the [[ref: holder]] to include a proof of
non-revocation (PoN-R) in the presentation, and then the [[ref: holder]] creating
the PoN-R and including it in the presentation sent to the [[ref: verifier]]. Both steps
are covered here.

**NOTE**: Often in discussions about verifiable presentations, the term "[[ref: prover]]"
is used to indicate the participant generating the request presentation.
Throughout the Hyperledger Indy AnonCreds implementation the term `[[ref: prover]]` is
used in the names of methods performed out by that participant. However, because
in AnonCreds the [[ref: holder]] and the [[ref: prover]] are always the same entity, we'll use
[[ref: holder]] to refer to the participant generating the requested presentation to
emphasize that the same entity is both issued credentials and generating the
presentations from those credentials.

##### Verifier Revocation Interval Request

The inclusion of a "Revocation Interval" by the [[ref: verifier]] in a presentation
request is a minimal extension to the Presentation Request data format that is
defined in the [Create Presentation Request](#create-presentation-request)
section of this document. Notably the `non_revoked` data item is added:

```json
"non_revoked" : {
    "from" : <epoch date>
    "to" : <epoch date>
}
```

The item may at the outer level of the presentation request, such that it
applies to all attributes and predicates, or with any or all of the attributes/predicates,
applying only to those specific attributes and/or predicates.

The use of "interval" is intended to have the semantic of saying that the [[ref:
verifier]] will accept a PoN-R from any point in the `from` to `to` interval.
The intention is that by being as flexible as the business rules allow means
that the [[ref: holder]] and/or the [[ref: verifier]] may have cached [[ref:
VDR]] data such that they don't have to go to the [[ref: VDR]] to get additional
[[ref: RevRegEntry]] data. In practice, the use of an interval here is not well
understood and tends to cause confusion amongst presentation request developers.
The AnonCreds community recommends always using matching `to` and `from` values
(see [Aries RFC 0441 Present Proof Best
Practices](https://github.com/hyperledger/aries-rfcs/tree/main/concepts/0441-present-proof-best-practices#semantics-of-non-revocation-interval-endpoints)).

While one would expect the `from` value to be the current time ("Prove the
credential is not revoked right now"), its use allows the [[ref: verifier]] to ask
for a PoN-R sometime in the past. This addresses use cases such as "Prove that
your car insurance policy was not revoked on June 12, 2021 when the accident
occurred."

##### [[ref: holder]] Generation of Proofs of Non-Revocation

A [[ref: holder]] preparing an AnonCreds presentation must determine what, if any, proofs
of non-revovcation (PoN-Rs) must be added to the presentation based on a
combination of what is in the proof request, and what verifiable credentials are
to be used in the presentation. As noted in the [previous
section](#verifier-revocation-interval-request), the presentation request may have the
`non-revoked` item at the outer-most level, applying to all
source credentials, or at the `requested_attribute` and/or
`requested_predicate` level, applying only to specific source credentials. For each,
the [[ref: holder]] must also determine if the verifiable credential selected for
attributes/predicates where a PoN-R is requested is a revocable credential.
Obviously, a PoN-R cannot be produced for a verifiable credential issued without
a [[ref: RevReg]].

Once the [[ref: holder]] has determined the required PoN-Rs needed for the presentation,
they must generate a PoN-R for each applicable source verifiable credential and
add the PoN-Rs to the presentation. For each, the [[ref: holder]] must collect the
applicable [[ref: RevReg]] data published by the [[ref: issuer]] and then generate the proof.

###### Collecting [[ref: RevRegEntry]] Data

In order to produce a PoN-R, the [[ref: holder]] must collect the following information from wherever the [[ref: issuer]]
has published the information. Note that the [[ref: holder]] may have some or all of this information cached
from data previously collected.

- The type of `issuance_type` of the [[ref: RevReg]] -- whether the initial state of the
  credentials in the registry is `active` or `revoked`. This information is part
  of the [[ref: RevReg]], and so likely cached by the [[ref: holder]] when they were first issued
  the credential.
- The tails file for [[ref: RevReg]], the location (a URL) of which is stored in the
  issued credential's [[ref: RevReg]]. The [[ref: holder]] likely (though not necessarily) would
  have collected the tails file at the time of issuance. Recall (from this
  section of the specification) that the tails file for a [[ref: RevReg]] is generated at
  creation time and does not change.
- The index of the credential within the [[ref: RevReg]] for the [[ref: holder]]'s specific
  credential being used in the presentation. This information is given to the
  [[ref: holder]] by the [[ref: issuer]] when the verifiable credential is issued.
- The accumulator published by the [[ref: issuer]] for the [[ref: RevRegEntry]] that the [[ref: holder]]
  will use in generating the PoN-R. In the Hyperledger Indy implementation of
  AnonCreds, the entries are published on the ledger, and collected via a
  special request to the ledger (detailed below).
- The revocation status changes of all of the credential indices up to the
  publication of the accumulator that the [[ref: holder]] will use in generating the
  proof. Required is the collection of all of the `issued` and `revoked` lists
  (as described [here](#anoncreds-credential-revocation-and-publication)) from
  all of the [[ref: RevRegEntry]] publication requests made by the [[ref: issuer]] up to and
  including the request that includes the accumulator being used by the [[ref: holder]]
  in generating the PoN-R.

The collection of the last two items is difficult without extra support of the
entity holding the published [[ref: RevReg]] (e.g. the [[ref: VDR]]/ledger).
Since each [[ref: RevRegEntry]] holds only the list of `active` and `revoked`
credential revocation status changes since the previous [[ref: RevRegEntry]]
(the "deltas"), a [[ref: holder]] must retrieve those lists from every [[ref:
RevRegEntry]] from [[ref: RevReg]] creation to the [[ref: RevRegEntry]] holding
the accumulator the [[ref: holder]] will use for generating the PoN-R. The
[[ref: issuer]] could have made many calls to publish [[ref: RevRegEntry]]
transactions, and the [[ref: holder]] would have to make a request for each one,
which is not practical (and perhaps not even possible). In the Hyperledger Indy
implementation, a special call
([`get_revoc_reg_delta`](https://github.com/hyperledger/indy-node/blob/master/docs/source/requests.md#get_revoc_reg_delta))
is used to collect the necessary data from all the [[ref: RevRegEntry]]
transactions for a specified interval in a single request. In the most used
version of the call, the interval in the request is `from` 0 (meaning from when
the [[ref: RevReg]] was created) `to` the current time. If the [[ref: holder]]
has called the routine previously with an earlier `to` value and cached the
results, the [[ref: holder]] MAY use the time of the cached result as the
`from`, so that only the credentials with revocation status changes since that
time are returned. The [[ref: holder]] then adds the returned lists to the
cached lists. If the [[ref: verifier]] has requested a "back in time" PoN-R, the
[[ref: holder]] may use a `to` date to match the date of interest to the [[ref:
verifier]]. When executed, the transaction returns:

- The full list of all `issued` and `revoked` entries in all of the [[ref: RevRegEntry]]
  transactions within the requested interval.
- The accumulator for the last [[ref: RevRegEntry]] within the requested interval.
- The timestamp (in the Unix epoch format) of the last [[ref: RevRegEntry]] in the
  interval.

Once collected, the [[ref: holder]] processes the `issued` and `revoked` lists
to determine the credential status (revoked or not) of every credential in the
[[ref: RevReg]]. As well, the [[ref: holder]] can at the point see if the
credential for which the PoN-R is being generated has been revoked, and decide
to continue with the process (producing an unverifiable "proof") or to stop the
process, perhaps with a notification to the [[ref: verifier]].

###### Generating the Proof of Non-Revocation

Given the data collected by the [[ref: holder]] to produce the PoN-R, the
following calculations are performed.

A `witness` is calculated in the same way as the accumulator (as described
[here](data_flow_setup.md#publishing-the-initial-initial-revocation-registry-entry-object)),
except the revocation status of the credential being proven as not revoked is
**not** included in the calculation. All of the tails file entries from the
other unrevoked credentials **are** included.

Once the witness, the accumulator and the value of the tails file entry for the
credential of interest is known, the PoN-R can be generated as follows:

:::todo
To Do: Outline the PoN-R proof calculation.
:::

Each PoN-R is added alongside the credential to which the PoN-R is applied, to the
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
To Do: Enumerate each of the items in each PoN-R section of the presentation.
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
timestamp (Unix epoch format) of the [[ref: RevRegEntry]] used to construct the PoN-R
(see example below). The [[ref: verifier]] needs the `rev_reg_id` and `timestamp` to get
the correct accumulator to use in verifying the PoN-R.

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

As always, the [[ref: holder]]'s presentation, with the embedded PoN-R(s), is set to the
[[ref: verifier]] to be cryptographically verified.

#### AnonCreds Verification with Revocation

A [[ref: verifier]] receives the presentation from the [[ref: holder]] and
processes the non-revocation-related parts of the presentation as described
[here](data_flow_presentation_verify.md#verify-presentation) in this
specification. In addition to what is outlined there, if there are any included
Proofs of Non-Revocation (PoN-Rs), the [[ref: verifier]] does the following for
each.

The [[ref: verifier]] begins by extracting from the section of the presentation
for a given revocable credential the `non_revoc_proof` and `identifiers` data
items. The [[ref: verifier]] must retrieve (possibly from its cache, otherwise
from the [[ref: VDR]]) the published [[ref: RevRegEntry]] given the `rev_reg_id`
and `timestamp` values from the `identifiers` data item. The [[ref: verifier]]
extracts the `accumulator` item from the [[ref: RevRegEntry]] retrieved. Note
that the [[ref: verifier]] does not need to collect the revocation status of all
of the credentials in the registry, nor the contents of the tails file for the
[[ref: RevReg]]. Only the issuer and [[ref: holder]] needs that data. During the
verification process, the [[ref: verifier]] does not learn the index of the
[[ref: holder]]'s credential in the [[ref: RevReg]].

Once the [[ref: verifier]] gets the data in the `non_revoc_proof` data item from
the presentation for the PoN-R being processed, plus the accumulator from
appropriate [[ref: RevRegEntry]], the following steps are carried out to verify
the PoN-R.

:::todo
To Do: Outline the PoN-R verification calculation.
:::

:::todo
To Do: Is there a separate process to bind the PoN-R to the credential?
:::

The verification code MUST surface to the [[ref: verifier]] if any part of the
presentation, including any PoNR(s), fail cryptographic verification. The
verification code MAY surface additional detail about what part of the
presentation failed, such as which PoN-R failed verification (if any).

The [[ref: verifier]] SHOULD evaluate the presentation to make sure that the
[[ref: holder]] provided all requested PoN-Rs. Notably, if any expected PoNRs
are not received in the presentation, the [[ref: verifier]] SHOULD check to see
if the given credential type is revocable. If not, it is acceptable that no
PoN-R was received. However, if the credential used in the generation of the
proof is revocable, and the [[ref: holder]] did not provide the P0N-R, the
verification code SHOULD surface to the [[ref: verifier]] that the presentation
failed cryptographic verification.
