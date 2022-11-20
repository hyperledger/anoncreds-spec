## AnonCreds Issuance Data Flow

The issuance of an anonymous [[ref: credential]] requires several steps and involves the roles [[ref: issuer]], [[ref: holder]] as well as the [[ref: Verifiable Data Registry]] (see diagram below).

```mermaid
sequenceDiagram
    autonumber
    participant L as Verifiable<br>Data Registry
    participant I as Issuer
    participant H as Holder  

  I ->> I: Create Credential Offer
  I ->> H: Send Credential Offer
  H ->> H: Verify Credential Offer
  opt
    H ->> L: Request Schema
    L ->> H: Return Schema
  end
  H ->> L: Request CRED_DEF
  L ->> H: Return CRED_DEF
  H ->> H: Create Credential Request
  H ->> I: Send Credential Request
  I ->> I: Verify Credential Request
  I ->> I: Issue Credential
  I ->> H: Send Credential
  H ->> H: Verify and Store Credential


  rect rgb(191, 223, 255)
    Note left of H: 💡The "Verifier" and "Schema Publisher" roles are<br>omitted in this diagram, since they do not participate<br>in the credential issuance data flow.
  end
```

The [[ref: issuer]] prepares a [[ref: Credential Offer]] for the [[ref: holder]] (step 1). A [[ref: Credential Offer]] includes a commitment about [[ref: credential]] (referencing a [[ref: CRED_DEF]]) the [[ref: issuer]] is intending to issue to the [[ref: holder]]. The [[ref: issuer]] sends the [[ref: Credential Offer]] to the [[ref: holder]] (step 2), who evaluates the offer (step 3) and fetches data about the offer (the [[ref: CRED_DEF]]) from the [[ref: Verifiable Data Registry]] (step 4-7).

Using the data from the [[ref: Credential Offer]] and the [[ref: CRED_DEF]] retrieved from the [[ref: Verifiable Data Registry]], the [[ref: holder]] prepares a [[ref: Credential Request]] (step 8), a formal request to the [[ref: issuer]] to issue a [[ref: credential]] based on the given [[ref: CRED_DEF]] to the [[ref: holder]], The [[ref: Credential Request]] includes a cryptographic commitment to the [[ref: holder]]'s [[ref: link secret]]. The [[ref: holder]] sends the [[ref: Credential Request]] to the [[ref: issuer]] (step 9).

The [[ref: issuer]] verifies and decides whether to accept the[[ref: Credential Request]] (step 10) and if so, prepares the [[ref: credential]] (step 11). The [[ref: issuer]] sends the [[ref: credential]] to the [[ref: holder]] (step 12), who verifies the [[ref: credential]] and (usually) securely stores it (step 13).

Details about each step in the issuance process are covered in the following sections.

### Credential Offer

The AnonCreds issuance process begins with the [[ref: issuer]] constructing and sending a [[ref: Credential Offer]] to the potential [[ref: holder]]. The Credential Offer contains the following JSON elements:

```json
{
    "schema_id": string,
    "cred_def_id": string,
    "nonce": string,
    "key_correctness_proof" : <key_correctness_proof>
}
```

::: todo

What is the purpose of the Nonce and the key correctness proof?

:::

* `schema_id`: The ID of the [[ref: Schema]] on which the [[ref: CRED_DEF]] for the offered [[ref: Credential]] is based.
* `cred_def_id`: The ID of the [[ref: CRED_DEF]] on which the [[ref: Credential]] to be issued will be based.
* `nonce`: A random number generated for one time use by the [[ref: issuer]] for preventing replay attacks and authentication between protocol steps. The `nonce` must be present in the subsequent [[ref: Credential Request]] from the [[ref: holder]].
* `key_correctness_proof`: A commitment to the data to be put into into the credential by the issuer. *TO BE ADDED: the purpose of the proof*

The JSON content of the `key_correctness_proof` is:

```json
"key_correctness_proof": {
    "c": "103...961",
    "xz_cap": "563...205",
    "xr_cap": [
        [
            "<attribute 1>",
            "821...452"
        ],
        [
            "master_secret",
            "156...104"
        ],
        [
            "<attribute 1>",
            "196...694"
        ]
    ]
}
```

The values in the proof are generated as follows:

* `c` (a [[ref: BigNumber]]) can be viewed as the committed value derived from the hash of the concatenated byte values in the process of [creating the CRED_DEF](#Issuer-Create-and-Publish-CRED_DEF-Object).

  $c = H(z || {r_i}  || \~{z} ||\~{r_i})$

  where
  * $z = s ^ {x_z}\ Mod\ n$ where `z`, `s` and `n` are values in the [[ref: CRED_DEF]]
  * $r_i$ are the values in the `r` map in [[ref: CRED_DEF]], individual attribute public keys
  * $\~z$ is similar to $z$ which equal to $s^{\~{x_z}}$, where $\~{x_z}$ is a randomly selected integer between `2` and `p'q'-1`
  * $r_i$ are the values in the `r` map in [[ref: CRED_DEF]]
  * $\~{r_i}$ is similar to $r$, which equal to $s^{\~{x_i}}\ mod\ n$, where $\~{x_i}$ are randomly selected integers between `2` and `p'q'-1`

* `xz_cap`: $\hat{x_z} = c x_z + \~{x_z}$
* `xr_cap`: Vec<(attribute_name_i, $cr_i + \~{r_i}$)>

Both  'xz_cap` and the second element of the `xr_cap` vector
are [[ref: BigNumbers]].

The [[ref: issuer]] sends the [[ref: Credential Offer]] to the [[ref: holder]].

### Credential Request

A [[ref: Credential Request]] is a formal request from a [[ref: holder]] to an [[ref: issuer]] to get a [[ref: credential]] based on the [[ref: Credential Offer]] (and the referenced [[ref: CRED_DEF]]) sent by the [[ref: issuer]] to the [[ref: holder]].

On receipt of the [[ref: Credential Offer]], the [[ref: holder]] retrieves the referenced [[ref: CRED_DEF]] from a [[ref: Verifiable Data Registry]]. The holder MAY want to retrieve the [[ref: Schema]] referenced in the [[ref: Credential Offer]]
and verify the consistency between the [[ref: Schema]] and [[ref: CRED_DEF]]. As [[ref: CRED_DEF]]s are immutable, the [[ref: holder]] may maintain a cached copy of the [[ref: CRED_DEF]].

In addition, the [[ref: holder]] also requires access to their [[ref: link secret]].

#### Verifying the Key Correctness Proof

The [[ref: holder]] must first verify the `key_correctness_proof` in the [[ref:
Credential Offer]] using data from the referenced [[ref: CRED_DEF]]. The
`key_correctness_proof` data is described in the [previous
section](#credential-offer) about the [[ref: Credential Offer]].

The `key_correctness_proof` verification is as follows:

1. Check that all attributes in [[ref: CRED_DEF]] and `master_secret` (an
   attribute that will be related to the [[ref: link_secret]]) are included in
   `xr_cap`.
1. Compute $c'$ (below).
1. If $c' == c$, the proof is accepted

$$c' = H(z || {r_i}  || \hat{z'} ||\hat{r_i'})$$

where we first find the inverse of $z$
$$ z^{-1}z = 1\ (Mod\ n) $$

Then
$$ \hat{z'} = z^{-c} s^{\hat{x_z}} \ (Mod\ n)$$
$$= z^{-c} s^{cx_z + \~{x_z}}\ (Mod\ n)$$
$$= z^{-c} z^{c}  s^{\~{x_z}}\ (Mod\ n)$$

$$ \hat{z'} = \~z$$

::: todo

What is the "both" referenced in the phrase below.

:::

Therefore $c'$ is equivalent to $c$ if the proof matches the [[ref: CRED_DEF]]
by simply using the multiplicative inverse of $z$ and $r_i$. Since the process
is same for both, we have demonstrated for $z$ only.

#### Constructing the Credential Request

The [[ref: holder]] constructs the following [[ref: Credential Request]] JSON structure:

```json
{
    "prover_did": "BZpdQDGp2ifid3u3Up17MG",
    "cred_def_id": "GvLGiRogTJubmj5B36qhYz:3:CL:8:faber.agent.degree_schema",
    "blinded_ms": {
        # Structure detailed below
    },
    "blinded_ms_correctness_proof": {
        # Structure detailed below
    },
    "nonce": "604812518357657692681285"
}
```

::: todo

Complete the data element descriptions in the following list.

:::

* `prover_did`: *To Be Added*
* `cred_def_id`: The ID of the [[ref: CRED_DEF]] on which the [[ref: Credential]] to be issued will be based.
* `blinded_ms`: The [[ref: link secret]] in its blinded form. Described in detail in the section [Blinding the Link Secret]](#blinding-the-link-secret) (below).
* `blinded_ms_correctness_proof`: The [[ref: Blinded Secrets Correctness Proof]] of the blinded [[ref: link secret]]. Described in detail in the section [The Blinded Link Secret Correctness Proof](#the-blinded-link-secret-correctness-proof) (below).
* `nonce`: Used for preventing replay attacks and authentication between protocol steps. *Generation Process to be added*

Once constructed, the [[ref: holder]] sends the [[ref: Credential Request]] to the [[ref: issuer]], who then can reply to the [[ref: holder]] by sending an issued credential.

##### Blinding the Link Secret

The `blinded_ms` (blinded link secret) in the `Credential Request` is a commitment by the [[ref: holder]] to the link secret. The `blinded_ms` will be signed by the [[ref issuer]], placed in the credential, and during presentations, is proven by the [[ref holder]] to be associated with the [[ref: link_secret]] using a proof of knowledge, without revealing the [[ref: link_secret]] itself. This is the capability that
enables the binding of the credential to the holder without revealing a correlatable identifier.

::: todo

Confirm purpose of the blinding factor and add how it is generated.

:::

A [[ref: blinding factor]] is a secret held by the [[ref: holder]] for blinding
the [[ref: link secret]] before sending it to [[ref: issuer]], and used later
when generating the proof of knowledge that the [[ref: link secret]] was used in
the signature received from the [[ref: issuer]]. The [[ref: blinding factor]],
$v$ is created by... *TO BE ADDED*

The process of blinding the link secret uses the [[ref: issuer]]'s
`CredentialPrimaryPublicKey`, $P$, which is included in the [[ref: CRED_DEF]],
and contains `z`, `r`, `s` and `n` (described
[here](#generating-a-cred_def-without-revocation-support)). While `r` contains
the public keys for all of the attributes to be signed, the only one of interest
in this process is $r_{link secret}$

The [[ref: link secret]], $A_l$ is blinded by

$A_{bl} = r_{link_secret}^{A_l}\ Mod\ n$

$A_{bl}$ is multiplied by the [[ref: blinding factor]], $v$,

$(s^v \times A_{bl})\ Mod\ n$

The resulting blinded link secret data structure inserted into the [[ref: Credential Offer]] is defined as follows:

```json
"blinded_ms": {
    "u": "331...544",
    "ur": null,  # Populated when the credential definition supports revoation
    "hidden_attributes": [
        "master_secret"
    ],
    "committed_attributes": {}
}
```

::: todo

Add in the missing details for the items in the list below.

:::

Where:

* `u`: *TO BE ADDED*
* `ur`: is `null` if revocation is not active for the [[ref: Credential Definition]], and if revocation is active is *TO BE ADDED*
* `hidden_attributes`: is an array of hidden attributes from the list of [[ref: Credential Definition]]. For AnonCreds v1.0, it is always a single entry of `master_secret`.
  * The [[ref: holder]]'s blinded [[ref: link secret]] is a default hidden attribute in AnonCreds, meaning it is not explicitly defined in the [[ref: Schema]] list of attributes but is included in both the [[ref: CRED_DEF]] and all issued [[ref: credentials]]. Whilst it is cryptographically possible to have multiple hidden attributes, in this version of AnonCreds, only [[ref: link secret]] is used.
* `committed_attributes`: An empty list of attributes in this version of AnonCreds.

##### The Blinded Link Secret Correctness Proof

In addition to creating the blinded link secret, the [[ref: holder]] also creates a blinded link secret correctness proof and inserts it into the [[ref: Credential Request]]. The data structure for the blinded link secret correctness proof is as follows:

```json
"blinded_ms_correctness_proof": {
    "c": "702...737",
    "v_dash_cap": "202...924",
    "m_caps": {
        "master_secret": "907...913"
    },
    "r_caps": {}
}
```

Where:

::: todo

Add in the missing details for the items in the list below.

:::

* `c`: is *TO BE ADDED*.
* `v_dash_cap`: is *TO BE ADDED*.
* `m_caps`: is *TO BE ADDED*.
* `r_caps`: is an empty structure in this version of AnonCreds. It is *TO BE ADDED*.

### Issue Credential

After the [[ref: issuer]] receives the [[ref: Credential Request]] from the [[ref: holder]], the [[ref: issuer]] processes the [[ref: Credential Request]] and decides whether to issue the credential as requested in the [[ref: Credential Request]] to the [[ref: holder]]. In this section, we'll cover issuing a credential that cannot be revoked, and then cover the additional steps/data elements in issuing a credential that can be revoked.

#### Verifying the Credential Request

Before deciding to issue the credential, the [[ref: issuer]] must first verify the [[ref: Credential Request]] from the [[ref: holder]] by checking first the nonce, and then the blinded link secret correctness proof.

::: todo

Add in the details about the nonce and the blinded link secret correctness proof.

:::

The nonce is checked by *TO BE ADDED*.

The blinded link secret correctness proof is verified by *TO BE ADDED*.

Once the Credential Request is verified and if the [[ref issuer]] decides to proceed with issuing the credential, the credential creation process is performed.

#### Encoding Attribute Data

The Anoncreds signature is not applied on the data attributes themselves, but rather on 32-byte integers encoded from the data attribute vales. In the current version of AnonCreds, the process of encoding the attributes (also known as canonicalization) is
a task performed by the [[ref: issuer]], who should do the encoding in a manner understood by *all* potential [[ref: verifiers]] such that any verifier can confirm that the revealed `raw` attributes in the presentation produce
the encoded value signed by the [[ref: issuer]]. To enable the broadest possible interoperability, the [Hyperledger Aries](https://www.hyperledger.org/projects/aries) community formalized the [following encoding rules](https://github.com/hyperledger/aries-rfcs/tree/main/features/0592-indy-attachments#encoding-claims) for the `raw` attribute values in an AnonCreds credential, and those rules are adopted into this specification, as follows:

* keep any integer as is
* convert any string integer (e.g. "1234") to be an integer (e.g. 1234)
* for data of any other type:
  * convert to string (use string "None" for null)
  * encode via utf-8 to bytes
  * apply SHA-256 to digest the bytes
  * convert the resulting digest bytes, big-endian, to integer
  * stringify the integer as a decimal.

An example implementation in Python of these rules can be found [here](https://github.com/hyperledger/aries-cloudagent-python/blob/0000f924a50b6ac5e6342bff90e64864672ee935/aries_cloudagent/messaging/util.py#L106).

A gist of test value pairs can be found [here](https://github.com/hyperledger/aries-cloudagent-python/blob/0000f924a50b6ac5e6342bff90e64864672ee935/aries_cloudagent/messaging/util.py#L106).

::: note

To enable broad interoperability, and to improve the security of AnonCreds by
eliminating the risk of a malicious [[ref: holders]] altering the `raw` data
values in hopes that the [[ref: verifier]] will not check the encoding as part
of the overall presentation verification, future versions of AnonCreds
credentials will not include [[ref: issuer]]-created encoded values, and will instead dynamically
encode the `raw` data values as needed.

Implementations of AnonCreds **MAY**

* Verify the encoded values provided by the issuer and reject the credential input if the encoding
  does not follow the encoding rules in this specification.
* Ignore the [[ref: issuer]]-provided encoded values and calculate the encoded
  values before generating signatures.
* Ignore the encoded values placed in credentials and/or presentations and
  generate the encoded values "on-the-fly" based on the encoding rules above.

:::

#### Constructing a Credential

To construct a non-revocable [[ref: credential]], the [[ref: issuer]] must have available:

* The identifiers for the [[ref: schema]] and [[ref: CRED-DEF]].
* The [[ref: CRED_DEF_PRIVATE]] data to be used in signing the credential.
* The `raw` value for each attribute to be included in the credential.
* The `encoded` value derived from each `raw` value using the [encoding attribute data](#encoding-attribute-data) rules (above).
* The blinded link secret from the [[ref: holder]]'s [[ref: Credential Request]].

Additional data is needed for issuing a revocable credential, as described in the section [Supporting Revocation in a Credential](#supporting-revocation-in-a-credential).

The JSON of a generated AnonCreds credential is as follows:

```json
{
    "schema_id": string,
    "cred_def_id": string,
    "rev_reg_id": null,
    "values": {
        "first_name": {
            "raw": "Alice",
            "encoded": "113...335"
        },
        "last_name": {
            "raw": "Garcia",
            "encoded": "532...452"
        },
        "birthdate_dateint": {
            "raw": "19981119",
            "encoded": "19981119"
        }
    },
    "signature": {
        "p_credential": {
            "m_2": "992...312",
            "a": "548...252",
            "e": "259...199",
            "v": "977...597"
        },
        "r_credential": null
    },
    "signature_correctness_proof": {
        "se": "898...935",
        "c": "935...598"
    },
    "rev_reg": null,
    "witness": null
}
```

* `schema_id`: is the ID of the [[ref: Schema]] upon which the [[ref: CRED_DEF]] was generated.
* `cred_def_id`: is the ID for the [[ref: CRED_DEF]] from which the credential was produced.
* `rev_reg_id` is `null` if the credential is not revocable. A description of the element when the credential is revocable is in the section [Supporting Revocation in a Credential](#supporting-revocation-in-a-credential).
* `values` is the list of attributes in the credential, including for each:
  * the name of the attribute (in this case `first_name`, `last_name`, and `birth_dateint`),
  * the `raw` data for the attribute, and
  * the `encoded` data for the attribute.
* `signature` is the cryptographic signature generated for the credential.
  * A description of the `p_signature` elements and generation process are in the section [The Credential Signature](#the-credential-signature).
  * `r_credential` is `null` if the credential is not revocable. A description of the `r_signature` elements and generation process when the credential is revocable are in the section [Supporting Revocation in a Credential](#supporting-revocation-in-a-credential).
* `signature_correctness_proof` is the signature correctness proof generated for the credential. A description of the elements and generation process are in the section [The Credential Signature Correctness Proof](#the-credential-signature).
* `rev_reg` is `null` if the credential is not revocable. A description of the element and generation process when the credential is revocable are in the section [Supporting Revocation in a Credential](#supporting-revocation-in-a-credential).
* `witness` is `null` if the credential is not revocable. A description of the element and generation process when the credential is revocable are in the section [Supporting Revocation in a Credential](#supporting-revocation-in-a-credential).

Once constructed, the [[ref issuer]] sends the credential to the [[ref: holder]] for verification and storage.

::: note

Note the data attribute "birth_dateint" in the example above. The convention of
putting a `_dateint` suffix on a credential attribute name is used to indicate
that the field contains a date in the form of an integer, such as "2022.11.21"
as the integer "20221121" (the number 20,221,121). By putting the date in that
form, AnonCreds predicates can be applied to the data, such as proving "older
than 21" based on date of birth without sharing the date of birth. This
convention was initially defined
[here](https://github.com/hyperledger/aries-rfcs/tree/main/concepts/0441-present-proof-best-practices#dates-and-predicates)
by the [Hyperledger Aries](https://www.hyperledger.org/projects/aries)
community.

:::

#### The Credential Signature

The credential signature elements are constructed as follows:

::: todo

Add the details about the credential signature data elements

:::

* `m_2` is the *TO BE ADDED*. It is constructed as follows:
  * *TO BE ADDED*
* `a` is the *TO BE ADDED*. It is constructed as follows:
  * *TO BE ADDED*
* `e` is the *TO BE ADDED*. It is constructed as follows:
  * *TO BE ADDED*
* `v` is the *TO BE ADDED*. It is constructed as follows:
  * *TO BE ADDED*

#### The Credential Signature Correctness Proof

The credential signature correction proof elements are constructed as follows:

::: todo

Add the details about the credential signature correctness proof data elements

:::

* `se` is the *TO BE ADDED*. It is constructed as follows:
  * *TO BE ADDED*
* `c` is the *TO BE ADDED*. It is constructed as follows:
  * *TO BE ADDED*

#### Supporting Revocation in a Credential

When a credential is revocable, in addition to the listed inputs needed for [constructing a credential](#constructing-a-credential),
the [[ref: issuer]] also needs the ID and private [[ref: Revocation Registry]] data. Using the inputs, the revocation-related fields in the [credential JSON](#constructing-a-credential) are populated. The
following describes the elements and how they are produced.

`rev_reg_id` is the ID of the [[ref: REV_REG_DEF]] published on a [[ref: Verifiable Data Registry]] that is to be used by the [[ref: holder]] when trying to generate a Non-Revocation Proof for this credential as part of an AnonCreds presentation.

`r_credential` is the following JSON data structure:

```json
"r_credential": {
    "sigma": "1 14C...8A8",
    "c": "12A...BB6",
    "vr_prime_prime": "0F3...FC4",
    "witness_signature": {
        "sigma_i": "1 1D72...000",
        "u_i": "1 0B3...000",
        "g_i": "1 10D...8A8"
    },
    "g_i": "1 10D7...8A8",
    "i": 1,
    "m2": "FDC...283"
}
```

The items in the data structure are:

::: todo

Add the details about the revocation signature, rev_reg and witness data elements

:::


* `sigma`: is *TO BE ADDED*
* `c`: is *TO BE ADDED*
* `vr_prime_prime`: is *TO BE ADDED*
* `witness_signature`:
  * `sigma_i`: is *TO BE ADDED*
  * `u_i`: is *TO BE ADDED*
  * `g_i`: is *TO BE ADDED*
* `g_i`: is *TO BE ADDED*
* `i`: is *TO BE ADDED*
* `m2`: is *TO BE ADDED*

`rev_reg` is the following JSON data structure:

```json
"rev_reg": {
    "accum": "21 118...1FB"
}
```

The item in the data structure are:

* `accum`: is *TO BE ADDED*

`witness` is the following JSON data structure:

```json
"witness": {
    "omega": "21 124...AC8"
}
```

The item in the data structure are:

* `omega`: is *TO BE ADDED*

### Receiving a Credential

On receipt of a credential from an [[ref: issuer]], the [[ref: holder]] must
verify the credential and, if verified, will likely store the credential in a
secure location.

To verify the `signature_correctness_proof`, the [[ref: holder]] does the following:

::: todo

Add the details about the verifying the credential signature correctness proof data elements and process.

:::

The verifying and securely storing of the credential by the [[ref: holder]]
completes the AnonCreds issuance process.

An AnonCreds credential is expected to be retained by the [[ref: holder]] that
participated in the issuance process. The [[ref: holder]] should not transfer
the credential to others for their use, and should use the credential only to
generate an AnonCreds verifiable presentation, as outlined in the
[AnonCreds Presentation](#anoncreds-presentation-data-flow) section of this specification.
