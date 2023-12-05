## W3C Verifiable Credentials Representation

This section describes how legacy AnonCreds credentials and presentations can be represented in the form of
W3C Verifiable Credentials standard.

### Credential

This section describes how [W3C credential concepts](https://www.w3.org/TR/vc-data-model/#basic-concepts) are applied to
AnonCreds W3C credential representation.

Example AnonCreds W3C Credential

::: example Example AnonCreds W3C Credential:
```json
[[insert: ./data/W3CCredential.json ]]
```
:::

#### Context

W3C [Context](https://www.w3.org/TR/vc-data-model/#contexts) section requires including of `@context` property to
verifiable credential.

The value of the `@context` property must be one or more resolvable [URI](https://www.w3.org/TR/vc-data-model/#dfn-uri)
that result in machine-readable [JSON-LD](https://www.w3.org/TR/vc-data-model/#json-ld) information about the object
format.

The **context** definition used for AnonCreds W3C credentials representation can be
discovered [here](../data/anoncreds-w3c-context.json).

In the case of W3C AnonCreds credentials, the `@context` attribute includes an extra
entry `https://raw.githubusercontent.com/hyperledger/anoncreds-spec/main/data/anoncreds-w3c-context.json`
which is required for the resolution of custom structure definitions and looks the following:

```json
{
  ...
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://raw.githubusercontent.com/hyperledger/anoncreds-spec/main/data/anoncreds-w3c-context.json"
  ],
  ...
}
```

#### Identifiers

W3C [Identifiers](https://www.w3.org/TR/vc-data-model/#identifiers) section defines an optional capability to assign
some kind of identifier to the verifiable credential so that others can express statements about the same thing.

In the case of W3C AnonCreds credentials, the `id` attribute is not included into `CL` credential proof signature, but
it
can be optionally set in credential to support other integrity proof types.

#### Types

W3C [Types](https://www.w3.org/TR/vc-data-model/#types) section requires including of `type` property to verifiable
credential.
The value of the `type` property must be one or more [URI](https://www.w3.org/TR/vc-data-model/#dfn-uri) resolvable
through the defined [@context](#context) to the information required for determining whether a verifiable credential has
a valid structure.

In the case of W3C AnonCreds credentials, the `type` attribute includes an extra entry `AnonCredsCredential`
pointing to the difference in a base credential structure and looks the following:

```json
{
  ... 
  "type": [
    "VerifiableCredential",         // general verifiable credential definition
    "AnonCredsCredential",          // definition for AnonCreds credentials
  ]
  ...
}
```

#### Credential Subject

W3C [Credential Subject](https://www.w3.org/TR/vc-data-model/#credential-subject) section requires including
of `credentialSubject` property to verifiable credential.

Credential subject value contains [claims](https://www.w3.org/TR/vc-data-model/#claims) about one or more subjects.

In the context of W3C AnonCreds credentials, credential subject property is compliant with the following statements:

- Credentials always include claims about only one subjects.
    - So that `credentialSubject` property is always represented as an object entry, but not an array.
- Credentials claims are always represented as key value pairs, where `value` is the `raw` value of CL credential
  attributes.
    - encoded CL credential values are not included in the credential subject

In the case of W3C AnonCreds credentials, the `credentialSubject` attribute looks the following:

```json
{
  ...
  "credentialSubject": {
    "firstName": "Alice",
    "lastName": "Jones",
    "age": "18"
  }
  ...
}
```

#### Data Schemas

W3C [Credential Schema](https://www.w3.org/TR/vc-data-model/#data-schemas) section defines an optional capability to
include `credentialSchema` property to enforce a specific structure on a given verifiable credential and encoding used
to map the claims of a verifiable credential to an alternative representation format.

In the case of W3C AnonCreds credentials, the `credentialSchema` attribute defines a custom `AnonCredsDefinition`
schema in order to include the information about AnonCreds related definitions to credential and looks the following:

```json
{
  ...
  "credentialSchema": {
    "type": "AnonCredsDefinition",
    "definition": "did:sov:3avoBCqDMFHFaKUHug9s8W:3:CL:13:default",
    "schema": "did:sov:3avoBCqDMFHFaKUHug9s8W:2:fabername:0.1.0",
    "encoding": "auto"
  },
  ...
}
```

**Credential Schema Data**:

* `type` - `AnonCredsDefinition`
* `schema` - id of [[ref: Schema]]
* `definition` - id of [[ref: Credential Definition]]
* `revocation_registry` - (Optional) id of [[ref: Revocation Registry Definition]]
* `encoding` - attributes encoding algorithm to apply for generating encoded credential values
    * encoded credential attribute values (binary representation required for doing CL signatures) are not included
      neither to `credentialSubject` or `signature`
    * `encoding: auto` implies using the algorithm defined
      at [Aries RFC 0592 Indy Attachments section](https://github.com/hyperledger/aries-rfcs/tree/main/features/0592-indy-attachments#encoding-claims)
      to generate encoded values under the hood during the signature generation and proof verification.

#### Issuer

W3C [Issuer](https://www.w3.org/TR/vc-data-model/#issuer) section requires including of `issuer` property to express the
[[ref: issuer]] of a verifiable credential.

In the case of W3C AnonCreds credentials, the `issuer` attribute should be represented as a
resolvable [DID URL](https://w3c-ccg.github.io/did-resolution/) and looks the following:

```json
{
  ...
  "issuer": "did:sov:3avoBCqDMFHFaKUHug9s8W",
  ...
}
```

#### Issuance Date

W3C [Issuance Date](https://www.w3.org/TR/vc-data-model/#issuance-date) section requires including of `issuanceDate`
property to express the date and time when a credential becomes valid.
The value of the `issuanceDate` property must be a string value of
an [XMLSCHEMA11-2](https://www.w3.org/TR/xmlschema11-2/#dateTime) combined date-time.

In the case of W3C AnonCreds credentials, the `issuanceDate` attribute should contain the time when a credential was
issued or
transformed from legacy form, and looks the following:

```json
{
  ...
  "issuanceDate": "2010-01-01T19:23:24Z",
  ...
}
```

#### Proofs (Signatures)

W3C [Proofs (Signatures)](https://www.w3.org/TR/vc-data-model/#proofs-signatures) section requires including of `proof`
property to express confirmation of the credential's validity.

According to the specification, one or many proof objects can be added to verifiable credentials.
In the case of W3C AnonCreds credentials, the `proof` attribute must contain `AnonCreds CL` proof
and may contain more [Non-AnonCreds Data Integrity](https://www.w3.org/TR/vc-data-model/#data-integrity-proofs) proofs.

##### AnonCreds CL proof

`AnonCreds CL` proof constructed from the `CL` signature of a verifiable credential.

The defined [@context](#context) includes a definition for the `AnonCredsProof2023` type describing the format of the
proof
entry:

```json
{
  ...
  "proof": [
    {
      "type": "AnonCredsProof2023",
      "signature": "AAAgf9w5lZg....RYp8Z_x3FqdwRHoWruiF0FlM"
    }
  ]
  ...
}
```

**Credential Proof Signature Data**:

* `type` - `AnonCredsProof2023`
* `signature` - CL credential signature as string received by:
    * building the following object from [cryptographic signature](./data_flow_issuance.md#the-credential-signature):
      ```json
      {
        "signature": {..}, 
        "signature_correctness_proof": {..},
        "rev_reg": Option<{..}>,
        "witness": Option<{..}>,
      }
      ```
        * `signature` - [cryptographic credential signature correctness proof](./data_flow_issuance.md#the-credential-signature)
          generated for the credential.
        * `signature_correctness_proof` -  [credential signature correctness proof](./data_flow_issuance.md#the-credential-signature)
          generated for the credential.
        * `rev_reg` - `null` if the credential is not revocable. A description of the element and generation process
          when the credential is revocable are in the
          section [Supporting Revocation in a Credential](./data_flow_issuance.md#supporting-revocation-in-a-credential).
        * `witness` - `null` if the credential is not revocable. A description of the element and generation process
          when the credential is revocable are in the
          section [Supporting Revocation in a Credential](./data_flow_issuance.md#supporting-revocation-in-a-credential).

    * encoding the object as described in the [section](#proof-data-encoding)

##### Non-AnonCreds Integrity proof

In order to better conform to the W3C specification AnonCreds based credential allows including
of non-AnonCreds [Data Integrity Proof](https://www.w3.org/TR/vc-data-model/#data-integrity-proofs) which must be
generated using one of NIST-approved algorithms (RSA, ECDSA, EdDSA).

#### Status

W3C [Status](https://www.w3.org/TR/vc-data-model/#status) section defines an optional capability to include
`credentialStatus` property to express credential status information, such as whether it is revoked.

In the case of W3C AnonCreds credentials, if a credential is revocable, the `type` attribute of `credentialStatus` must
be `AnonCredsCredentialStatusList2023` (defined in the scope of [@context](#context)) pointing that
[AnonCreds Credential Revocation Flow](./data_flow_revocation.md) is used for credential issuance.
The `id` attribute of `credentialStatus` must contain id of revocation registry.

Also, credential revocation data including revocation registry and witness values (`rev_reg` and `witness`) must be
included into the credential proof signature as demonstrated above in [AnonCreds CL proof](#anoncreds-cl-proof) section.

A description of generation process when the credential is revocable is in the
section [Supporting Revocation in a Credential](./data_flow_issuance.md#supporting-revocation-in-a-credential).

```json
{
  ...
  "credentialStatus": {
    "type": "AnonCredsCredentialStatusList2023",
    "id": "did:sov:NcYxiDXkpYi6ov5FcYDi1e:4:NcYxiDXkpYi6ov5FcYDi1e:3:CL:NcYxiDXkpYi6ov5FcYDi1e:2:gvt:1.0:tag:CL_ACCUM:TAG_1"
  },
  ...
}
```

#### Expiration

W3C [Expiration](https://www.w3.org/TR/vc-data-model/#expiration) section defines an optional capability to include
credential expiration information.

In the case of W3C AnonCreds credentials, instead of including `expirationDate` property there is defined another
[Announced Revocation Data Flow](./data_flow_revocation.md) implementing through
the using if [`credentialStatus`](#status) property.

```json
{
  ...
  "credentialStatus": {
    "type": "AnonCredsCredentialStatusList2023",
    "id": "did:sov:NcYxiDXkpYi6ov5FcYDi1e:4:NcYxiDXkpYi6ov5FcYDi1e:3:CL:NcYxiDXkpYi6ov5FcYDi1e:2:gvt:1.0:tag:CL_ACCUM:TAG_1"
  },
  ...
}
```

### AnonCreds W3C Revocable Credential

::: example Example AnonCreds W3C Revocable Credential
```json
[[insert: ./data/W3CCredentialWithRevocation.json ]]
```
:::

### Presentation

This section describes how [W3C presentation concepts](https://www.w3.org/TR/vc-data-model/#contexts) are applied to
AnonCreds W3C presentation representation.

Example AnonCreds W3C Presentation:

::: example Example AnonCreds W3C Presentation:
```json
[[insert: ./data/W3CPresentation.json ]]
```
:::

#### Context

W3C [Context](https://www.w3.org/TR/vc-data-model/#contexts) section requires including of `@context` property to
verifiable presentation.

The value of the `@context` property must be one or more resolvable [URI](https://www.w3.org/TR/vc-data-model/#dfn-uri)
that result in machine-readable [JSON-LD](https://www.w3.org/TR/vc-data-model/#json-ld) information about the object
format.

The **context** definition used for AnonCreds W3C presentations representation can be
discovered [here](../data/anoncreds-w3c-context.json).

In the case of W3C AnonCreds presentations, the `@context` attribute includes an extra
entry `https://raw.githubusercontent.com/hyperledger/anoncreds-spec/main/data/anoncreds-w3c-context.json`
which is required for the resolution of custom structure definitions and looks the following:

```json
{
  ...
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://raw.githubusercontent.com/hyperledger/anoncreds-spec/main/data/anoncreds-w3c-context.json"
  ],
  ...
}
```

#### Types

W3C [Types](https://www.w3.org/TR/vc-data-model/#types) section requires including of `type` property to verifiable
presentation.
The value of the `type` property must be one or more [URI](https://www.w3.org/TR/vc-data-model/#dfn-uri) resolvable
through the defined [@context](#context) to the information required for determining whether a verifiable presentation
has a valid structure.

In the case of W3C AnonCreds presentations, the `type` attribute includes an extra entry `AnonCredsPresentation`
pointing to the difference in a base presentation structure and looks the following:

```json
{
  ... 
  "type": [
    "VerifiablePresentation",         // general verifiable presentation definition
    "AnonCredsPresentation"           // definition for AnonCreds presentation
  ]
  ...
}
```

#### Verifiable Credential

W3C [Verifiable Credential](https://www.w3.org/TR/vc-data-model/#presentations-0) section requires including
of `verifiableCredential` property to a verifiable presentation constructed from one or
more [verifiable credentials](#credential).

The listed [credentials](#credential) must include attributes and predicated requested in
the [[ref: presentation request]].

[Verifiable credentials](#credential) mostly looks same as described at the [Credential Structure](#credential)
section but with some differences.

##### Credential Subject

In the case of W3C AnonCreds presentations, in contrast to the general verifiable credential structure
(when all attributes represented as key value pairs), the `credentialSubject` attribute values can be represented
in two forms:

* string - corresponds to a requested attribute which was revealed in the presentation
    ```json
        "credentialSubject":{
            ...
            "firstName":"Alice",
            ...
        }
    ```
* array of objects - corresponds to a requested predicates resolved by presentation without revealing an exact value
    * The value is an array as multiple predicates can be requested over the same attributed
    ```json
        "credentialSubject":{
            ...
            "age":[
                {
                  "type":"AnonCredsPredicate",
                  "predicate":">=",
                  "value":18
                }
            ]
            ...
        }
    ```
    * A predicate object consists of the following data:
        * `type` - `AnonCredsPredicate` type defined in the scope of [@context](#context) and describes the format of
          the resolved predicate
        * `predicate` - type of the predicate: [same as in request](./data_flow_presentation_create_request.md)
        * `value` - value of the predicate: [same as in request](./data_flow_presentation_create_request.md)

##### Proof (Signature)

In the case of W3C AnonCreds presentations, the `proof` attribute for each verifiable credential must be an object of
`AnonCredsPresentationProof2023` type which looks the following:

```json
  "proof": {
    "type": "AnonCredsPresentationProof2023",
    "proofValue": "AAEBAnr2Ql...0UhJ-bIIdWFKVWxjU3ePxv_7HoY5pUw",
    "timestamp": Option<1234567>,
  }
```

**Verifiable Credential Proof Data**

* `proofValue` - CL credential proof as string received by:
    * building the following object from [cryptographic proof](./data_flow_presentation_create_presentation.md)
      data:
        ```json
            {
                sub_proof: {
                    "primary_proof": { ... },
                    "non_revoc_proof": { ... }  
                }
            }
        ```
        * `sub_proof` - [cryptographyc proof](./data_flow_presentation_create_presentation.md#generate-the-presentation)
          generated for each used credential
    * encoding the object as described in the [section](#proof-data-encoding)
* `timestamp` - (Optional) if revocation supported and requested, time as a total number of seconds from Unix Epoch
  representing pointing to the specif moment of revocation registry

#### Proof

W3C [Proofs (Signatures)](https://www.w3.org/TR/vc-data-model/#proofs-signatures) section requires including of `proof`
property to express confirmation of the presentation's validity.

As we described in the above section verifiable credentials can contain two proof entries (CL AnonCreds of Non-AnonCreds
Data Integrity).
Unlike verifiable credentials, presentations can contain only one proof object.

It is [[ref: verifier]] and [[ref: holder]] responsibility to negotiate which proof must be used
(CL AnonCreds of Non-AnonCreds Data Integrity) in the presentation:

* Generate an W3C AnonCreds presentation, with all it’s privacy-preserving power and predicates
* Present the VC using one of Non-AnonCreds Integrity Proof Signatures

```json
{
  ...
  "proof": {
    "type": "AnonCredsPresentationProof2023",
    "challenge": "182453895158932070575246",
    "proofValue": "AAAgtMR4DrkY--ZVgKHmUANE04ET7TzUxZ0vZmVcNt4nCkwBABUACQJ69kJVIxHVAQAIAaJ19l-agSA"
  }
  ...
}
```

**Presentation Proof structure**

* `challenge` - [[ref: nonce]] taken from the [[ref: presentation request]]
* `proofValue` - aggregated CL proof as string received by:
    * building the following object from [cryptographic proof](./data_flow_presentation_create_presentation.md)
      data:
      ```json
        {
            aggregated: { 
                "c_hash": "...",
                "c_list": [...]
            }
        }
      ```
        * `aggregated` - [aggregate proof](./data_flow_presentation_create_presentation.md#generate-the-presentation),
          across all the source credentials that proves that the same link secret was used in the issuance of all the
          credentials.
    * encoding the object as described in the [section](#proof-data-encoding)

### AnonCreds W3C Presentation containing Revocable Credential

::: example Example AnonCreds W3C Presentation containing Revocable Credential:
```json
[[insert: ./data/W3CPresentationWithRevocation.json ]]
```
:::

### Proof data encoding

1. Almost all properties of AnonCreds [[ref: credential]] signature and [[ref: presentation]] are big numbers.
   The traditional JSON serialization os such data is not very compact.
   Instead, we use [MessagePack](https://msgpack.org/) binary data serialization format which is faster and produces
   smaller value.
   You can find more details on how [MessagePack](https://msgpack.org/) works reading
   the [specification](https://github.com/msgpack/msgpack/blob/master/spec.md).

2. Encoding the resulting bytes as [Base64Url](https://tools.ietf.org/html/rfc4648#section-5) string without padding

### Context

The AnonCreds context, located
at https://raw.githubusercontent.com/hyperledger/anoncreds-spec/main/data/anoncreds-w3c-context.json can be used to
implement a local cached copy.
For convenience, the AnonCreds context is also provided in this section.

:::

::: example
```json
[[insert: ./data/anoncreds-w3c-context.json ]]
```

:::