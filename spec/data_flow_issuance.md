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
  H ->> L: Request Credential Definition
  L ->> H: Return Credential Definition
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

The [[ref: issuer]] prepares a [[ref: Credential Offer]] for the [[ref: holder]] (step 1). A [[ref: Credential Offer]] includes a commitment about the [[ref: credential]] (referencing a [[ref: Public Credential Definition]]) the [[ref: issuer]] is intending to issue to the [[ref: holder]]. The [[ref: issuer]] sends the [[ref: Credential Offer]] to the [[ref: holder]] (step 2), who evaluates the offer (step 3) and fetches data about the offer (the [[ref: Public Credential Definition]]) from the [[ref: Verifiable Data Registry]] (steps 4-7).

Using the data from the [[ref: Credential Offer]] and the [[ref: Public Credential Definition]] retrieved from the [[ref: Verifiable Data Registry]], the [[ref: holder]] prepares a [[ref: Credential Request]] (step 8), a formal request to the [[ref: issuer]] to issue a [[ref: credential]] based on the given [[ref: Public Credential Definition]] to the [[ref: holder]]. The [[ref: Credential Request]] includes a cryptographic commitment to the [[ref: holder]]'s [[ref: link secret]]. The [[ref: holder]] sends the [[ref: Credential Request]] to the [[ref: issuer]] (step 9).

The [[ref: issuer]] verifies and decides whether to accept the [[ref: Credential Request]] (step 10) and if so, prepares the [[ref: credential]] (step 11). The [[ref: issuer]] sends the [[ref: credential]] to the [[ref: holder]] (step 12), who verifies the [[ref: credential]] and (usually) securely stores it (step 13).

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

* `schema_id`: The ID of the [[ref: Schema]] on which the [[ref: Public Credential Definition]] for the offered [[ref: Credential]] is based.
* `cred_def_id`: The ID of the [[ref: Public Credential Definition]] on which the [[ref: Credential]] to be issued will be based.
* `nonce`: A random number generated for one time use by the [[ref: issuer]] for preventing replay attacks and authentication between protocol steps. The `nonce` must be present in the subsequent [[ref: Credential Request]] from the [[ref: holder]].
* `key_correctness_proof`: The Fiat-Shamir transformation challenge value in the non-interactive mode of [Schnorr Protocol](https://d-nb.info/1156214580/34). It is calculated by the [[ref: issuer]] as the proof of knowledge of the private key used to create the [[ref: Credential Definition]]. This is verified by the [[ref: holder]] during the creation of [[ref: Credential Request]].

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

* `c`: (a [[ref: BigNumber]]) can be viewed as the committed value derived from the hash of the concatenated byte values in the process of [creating the Credential Definition].

[creating the Credential Definition]: #generating-a-credential-definition-without-revocation-support

  $$c = H(z || {r_i}  || \tilde{z} ||\tilde{r_i})$$

  where

  * $z = s ^ {x_z}\ Mod\ n$ where $z$, $s$ and $n$ are values in the [[ref: Public Credential Definition]]
  * $r_i$ are the values in the $r$ map in [[ref: Public Credential Definition]], individual attribute public keys
  * $\tilde{z}$ is similar to $z$ which equals to $s^{\tilde{x_z}}\ mod\ n$, where $\tilde{x_z}$ is a randomly selected integer between $2$ and $p'q'-1$
  * $\tilde{r_i}$ is similar to $r$, which equal to $s^{\tilde{x_i}}\ mod\ n$, where $\tilde{x_i}$ are randomly selected integers between $2$ and $p'q'-1$

* `xz_cap`: $\hat{x_z} = c x_z + \tilde{x_z}$
* `xr_cap`: $\{ (attribute_i, cr_i + \tilde{r_i}) \}_{1 < i < L}$ for $L$ attributes

Both  `xz_cap` and the second element in the tuple of the `xr_cap` vector
are [[ref: BigNumbers]].

The [[ref: issuer]] sends the [[ref: Credential Offer]] to the [[ref: holder]].

### Credential Request

A [[ref: Credential Request]] is a formal request from a [[ref: holder]] to an
[[ref: issuer]] to get a [[ref: credential]] based on the [[ref: Credential
Offer]] (and the referenced [[ref: Public Credential Definition]]) sent by the
[[ref: issuer]] to the [[ref: holder]].

On receipt of the [[ref: Credential Offer]], the [[ref: holder]] retrieves the
referenced [[ref: Public Credential Definition]] from a [[ref: Verifiable Data
Registry]]. The holder MAY want to retrieve the [[ref: Schema]] referenced in
the [[ref: Credential Offer]] and verify the consistency between the list of
attributes in the [[ref: Schema]] and in the [[ref: Public Credential
Definition]].

The nonce of the [[ref: Credential Offer]] is used to generate the proof of correctness
for blinded credential secrets, where it is hashed with the blinded secrets to
create the proof which is sent to the [[ref: issuer]].

In addition, the [[ref: holder]] also requires access to their [[ref: link
secret]].

#### Verifying the Key Correctness Proof

The [[ref: holder]] must first verify the `key_correctness_proof` in the [[ref:
Credential Offer]] using data from the referenced [[ref: Public Credential Definition]]. The
`key_correctness_proof` data is described in the [previous
section](#credential-offer) about the [[ref: Credential Offer]].

The `key_correctness_proof` verification is as follows:

1. Check that all attributes in [[ref: Public Credential Definition]] and `master_secret` (an
   attribute that will be related to the [[ref: link_secret]]) are included in
   `xr_cap`.
1. Compute $c'$, where  $c' = H(z || {r_i}  || \hat{z'} ||\hat{r_i'})$.
1. If $\hat{z'} == \tilde{z}$ and $\hat{r_i'} == \tilde{r_i}$, then $c' == c$. The proof is accepted.

For $\hat{z'}$, we first find the multiplicative inverse of $z$
$$ z^{-1}z = 1\ (Mod\ n) $$

Then
$$ \hat{z'} = z^{-c} s^{\hat{x_z}} \ (Mod\ n)$$
$$= z^{-c} s^{cx_z + \tilde{x_z}}\ (Mod\ n)$$
$$= z^{-c} z^{c} s^{\tilde{x_z}}\ (Mod\ n)$$
$$ \hat{z'} = \tilde{z}$$

The same can be derived for all $\hat{r_i'}$  by finding the multiplicative inverse of $r_i$, where {1 < i < L} for $L$ attributes.

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

* `entropy`: a required string.
  * Called `prover_did` in earlier AnonCreds implementations, and called
  `prover_id` in [Ursa](https://github.com/hyperledger/ursa), `entropy` is a
  random alphanumeric string generated by the [[ref: holder]] and used by the
  [[ref:issuer]] to add entropy in generating the credential signature. The
  value is combined by the [[ref: issuer]] with the credential revocation index
  (`cred_idx`) if the credential is revocable, and the resulting string is hashed
  to create the `credential_context`, an input to the credential signing
  process. The `credential_context` is the `m2` item in the issued verifiable
  credential signature.
  * Historically in Aries agent implementations, the `prover_did` was populated by
  the [[ref: holder]] with a [[ref: DID]] they hold, usually the DIDComm
  peer-to-peer DID shared by the the [[ref: holder]] to the [[ref: issuer]].
  However, the item is not verified by the [[ref: issuer]] as a DID nor as an identifier
  for the [[ref: holder]], and as such an random string is sufficient.
  * The [[ref: holder]] can verify the provide `entropy` value was used by the
    [[ref: issuer] in generating the signature by combining `entropy` with the
    `cred_idx` value from the issuer (if the credential is revocable), hashing
    the resulting string and checking that the hash matches `m2` in the
    credential signature.
* `cred_def_id`: The ID of the [[ref: Public Credential Definition]] on which the [[ref: Credential]] to be issued will be based.
* `blinded_ms`: The [[ref: link secret]] in its blinded form. Described in detail in the section [Blinding the Link Secret](#blinding-the-link-secret) (below).
* `blinded_ms_correctness_proof`: The [[ref: Blinded Secrets Correctness Proof]] of the blinded [[ref: link secret]]. Described in detail in the section [The Blinded Link Secret Correctness Proof](#the-blinded-link-secret-correctness-proof) (below).
* `nonce`: Used for preventing replay attacks and authentication between protocol steps. The [[ref: holder]] creates an 80 bit nonce in the request which is a randomly 
generated number.

[legacy Indy AnonCreds Method]: https://hyperledger.github.io/anoncreds-methods-registry/#hyperledger-indy-legacy-anoncreds-method

Once constructed, the [[ref: holder]] sends the [[ref: Credential Request]] to the [[ref: issuer]], who then can reply to the [[ref: holder]] by sending an issued credential.

#### Blinding the Link Secret

The `blinded_ms` ([[ref: blinded link secret]]) in the `Credential Request` is a
cryptographic commitment by the [[ref: holder]] to the link secret. The
`blinded_ms` will be signed by the [[ref issuer]], placed in the credential, and
during presentations, is proven by the [[ref holder]] to be associated with the
[[ref: link_secret]] using a proof of knowledge, without revealing the [[ref:
link_secret]] itself. This is the capability that enables the binding of the
credential to the holder without revealing a correlatable identifier.

The [[ref: blinding factor]] is a secret held by the [[ref: holder]] for blinding
the [[ref: link secret]] before sending it to the [[ref: issuer]], and used later
when generating the proof of knowledge that the [[ref: link secret]] was used in
the signature received from the [[ref: issuer]]. The [[ref: blinding factor]],
$v$ is created by the [[ref: holder]] generating a 3152-bit random number.

The process of blinding the link secret uses the [[ref: issuer]]'s
`CredentialPrimaryPublicKey`, $P$, which is included in the [[ref: Public Credential Definition]],
and contains `z`, `r`, `s` and `n` (described
[here](#generating-a-cred_def-without-revocation-support)). While `r` contains
the public keys for all of the attributes to be signed, the only one of interest
in this process is $r_{link secret}$

The [[ref: link secret]], $A_l$ is blinded by

$A_{bl} = r_{link secret}^{A_l}\ Mod\ n$

$A_{bl}$ is multiplied by the [[ref: blinding factor]], $v'$,

$(s^{v'}  \times A_{bl})\ Mod\ n$

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


* `u`: is the blinded link secret which is $(s^v \times A_{bl})\ Mod\ n$.
* `ur`: is `null` if revocation is not active for the [[ref: Public Credential Definition], and if revocation is active $u_r = h_2^{s'_r}$ where $s'_r$ is randomly selected quadratic residue of order of the bilinear groups `q` and $h_2$ is  part of the revocation public key.
* `hidden_attributes`: is an array of hidden attributes from the list of [[ref: Public Credential Definition]]. For AnonCreds v1.0, it is always a single entry of `master_secret`.

  * The [[ref: holder]]'s blinded [[ref: link secret]] is a default hidden attribute in AnonCreds, meaning it is not explicitly defined in the [[ref: Schema]] list of attributes but is included in both the [[ref: Public Credential Definition]] and all issued [[ref: credentials]]. Whilst it is cryptographically possible to have multiple hidden attributes, in this version of AnonCreds, only [[ref: link secret]] is used.
* `committed_attributes`: An empty list of attributes in this version of AnonCreds.

#### The Blinded Link Secret Correctness Proof

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


The values in the proof are generated as follows:

* `c`: (a [[ref: BigNumber]]) can be viewed as the committed value derived from the hash of the concatenated byte values in the process of [creating the Credential Definition] and the `nonce` value .

[creating the Credential Definition]: #generating-a-credential-definition-without-revocation-support

  $$c = H(u || \tilde{u}  || n_0)$$

  where

  * $u$ is described above.
  * $\tilde{u} = s^{\tilde{v}'} \times r_{linksecret}^{\tilde{A_l}}\ mod\ n$ where $\tilde{v}'$ is randomly selected 3488-bit value and $\tilde{A_l}$ is 593-bit value by reference [_Anonymous credentials with type-3 revocation_ by Dmitry Khovratovisch, Michael Lodder and Cam Parra](https://github.com/hyperledger/anoncreds-spec/blob/main/spec/ursaAnonCreds.pdf)
  * $n_0$ is the nonce value.

  
* `v_dash_cap`: $\hat{v'} \leftarrow \tilde{v'} + cv'$, where $v'$ is the blinding factor and $\tilde{v'}$ is a 3488-bit random number.
* `m_caps`: $\hat{m} = \tilde{A_l} + cA_l$
* `r_caps`: is an empty structure in this version of AnonCreds.

### Issue Credential

After the [[ref: issuer]] receives the [[ref: Credential Request]] from the [[ref: holder]], the [[ref: issuer]] processes the [[ref: Credential Request]] and decides whether to issue the credential as requested in the [[ref: Credential Request]] to the [[ref: holder]]. In this section, we'll cover issuing a credential that cannot be revoked, and then cover the additional steps/data elements in issuing a credential that can be revoked.

#### Verifying the Credential Request

Before deciding to issue the credential, the [[ref: issuer]] must first verify the [[ref: Credential Request]] from the [[ref: holder]] by checking first the nonce, and then the blinded link secret correctness proof.
 

The `blinded_ms_correctness_proof` is verified by [[ref: issuer]]. The `blinded_ms_correctness_proof` verification is as follows:


1. Compute $c'$, where  $c' = H(u || \hat{u}  || n_0)$.
2. If $\hat{u} == \tilde{u}$, then $c' == c$. The proof is accepted.

For $\hat{u}$, we first find the multiplicative inverse of $u$
$$ u^{-1}u = 1\ (Mod\ n) $$

Then
$$ \hat{u} = u^{-c} \times r_{linksecret}^{\hat{m} } \times s^{\hat{v'}} \ (Mod\ n)$$
$$= u^{-c} \times  r_{linksecret}^{\tilde{A_l}+ cA_l } \times s^{ \tilde{v'} + cv'}\ (Mod\ n)$$
$$= u^{-c} \times u^{c} \times  r_{linksecret}^{\tilde{A_l}} \times s^{\tilde{v'}}\ (Mod\ n)$$
$$ \hat{u} = \tilde{u}$$



Once the Credential Request is verified and if the [[ref issuer]] decides to proceed with issuing the credential, the credential creation process is performed.

#### Encoding Attribute Data

The Anoncreds signature is not applied on the data attributes themselves, but rather on 32-byte integers encoded from the data attribute values. In the current version of AnonCreds, the process of encoding the attributes (also known as canonicalization) is
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
eliminating the risk of malicious [[ref: holders]] altering the `raw` data
values in hopes that the [[ref: verifier]] will not check the encoding as part
of the overall presentation verification, future versions of AnonCreds
credentials will not include [[ref: issuer]]-created encoded values in the AnonCreds [[ref: credentials]], and will instead
require the encoding of the `raw` data values on as needed basis.

Implementations of AnonCreds **MAY**

* Verify the encoded values provided by the issuer and reject the credential input if the encoding
  does not follow the encoding rules in this specification.
* Ignore the [[ref: issuer]]-provided encoded values and calculate the encoded
  values before generating signatures based on the encoding rules above.
* Ignore the encoded values placed in credentials and/or presentations and
  generate the encoded values "on-the-fly" based on the encoding rules above.

:::

#### Constructing a Credential

To construct a non-revocable [[ref: credential]], the [[ref: issuer]] must have available:

* The identifiers for the [[ref: schema]] and [[ref: Public Credential Definition]].
* The [[ref: Private Credential Definition]] data to be used in signing the credential.
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

* `schema_id`: is the ID of the [[ref: Schema]] upon which the [[ref: Public Credential Definition]] was generated.
* `cred_def_id`: is the ID for the [[ref:Public Credential Definition]] on which the [[ref:Credential]] issued is based.
* `rev_reg_id` is `null` if the credential is not revocable. A description of the element when the credential is revocable is in the section [Supporting Revocation in a Credential](#supporting-revocation-in-a-credential).
* `values` is the list of attributes in the credential, including for each:
  * the name of the attribute (in this case `first_name`, `last_name`, and `birth_dateint`),
  * the `raw` data for the attribute, and
  * the `encoded` data for the attribute, derived from the `raw` value has defined in the [encoding attribute data rules](#encoding-attribute-data).
* `signature` is the cryptographic signature generated for the credential.
  * A description of the `p_signature` elements and generation process are in the section [The Credential Signature](#the-credential-signature).
  * `r_credential` is `null` if the credential is not revocable. A description of the `r_signature` elements and generation process when the credential is revocable are in the section [Supporting Revocation in a Credential](#supporting-revocation-in-a-credential).
* `signature_correctness_proof` is the [[ref: Signature Correctness Proof]] generated for the credential. A description of the elements and generation process are in the section [The Credential Signature Correctness Proof](#the-credential-signature).
* `rev_reg` is `null` if the credential is not revocable. A description of the element and generation process when the credential is revocable are in the section [Supporting Revocation in a Credential](#supporting-revocation-in-a-credential).
* `witness` is `null` if the credential is not revocable. A description of the element and generation process when the credential is revocable are in the section [Supporting Revocation in a Credential](#supporting-revocation-in-a-credential).

Once constructed, the [[ref issuer]] sends the credential to the [[ref: holder]] for verification and storage.

::: note

Please note the data attribute "birth_dateint" in the example above. The convention of
putting a `_dateint` suffix on a credential attribute name is used to indicate
that the field contains a date in the form of an integer, such as "2022.11.21"
as the integer "20221121" (the number 20,221,121). By putting the date in that
form, AnonCreds predicates can be applied to the data, such as proving "older
than 21" based on date of birth without sharing the date of birth. This
convention was initially defined
[here](https://github.com/hyperledger/aries-rfcs/tree/main/concepts/0441-present-proof-best-practices#dates-and-predicates)
by the [Hyperledger Aries](https://www.hyperledger.org/projects/aries)
community.

#### The Credential Signature

The credential signature elements are constructed as follows:

1. Compute $q = \frac{Z}{us^{v''}r^{m}_{linksecret}\ (Mod\ n)}$ where $v''$ is a random 2724-bit number with most significant bit as $1$ and $e$ is a random prime such that $2^{596} \leq e \leq 2^{596}+2^{119}$
2. Compute $a = q^{e^{-1}\ (Mod\ p'q')}\ (Mod\ n)$ where $p', q'$ are primes generated during issuer setup, and $e^{-1}$ is the multiplicative inverse of $e$.

* `m_2` is a linkable identifier to the holder encoded in base 10 that is also called the `master_secret` in old versions. It is constructed as follows:
  * $m_2 = H(i || \mathcal{H})$, where $i$ is an index assigned to the holder, and $\mathcal{H}$ is an identifier with which the [[ref: holder]] is known to the [[ref: issuer]].
* `a` is the signature of the blinded known attributes. It's generation is given above.
* `e` is a random prime generated by the [[ref: issuer]] for creating signature.
* `v` is a number generated by the [[ref: holder]] to unblind the signature of the blinded attributes. It is constructed as follows:
  * $v = v' + v''$, where $v'$ is the blinding factor which the holder has and $v''$ is a random number generated by the issuer.

#### The Credential Signature Correctness Proof

The credential signature correction proof elements are constructed as follows:

Using random $r<p'q'$, compute 
$$\hat{a} = q^r (Mod\ n)$$
$$ c = H(q||a||\hat{a}||n_1) $$
where $n_1$ is the `nonce` from credential request and $H$ is SHA-256 hashing algorithm.
Signature correctness proof $s_e = r - ce^{-1} (Mod\ p'q')$.


* `se` is the credential signature correctness proof. 
* `c` is the witness for the credential signature correctness proof.

#### Supporting Revocation in a Credential

When a credential is revocable, in addition to the listed inputs needed for [constructing a credential](#constructing-a-credential),
the [[ref: issuer]] also needs the ID and private [[ref: Revocation Registry]] data. Using the inputs, the revocation-related fields in the [credential JSON](#constructing-a-credential) are populated. The
following describes the elements and how they are produced.

`rev_reg_id` is the ID of the [[ref: Revocation Registry Definition]] published on a [[ref: Verifiable Data Registry]] that is to be used by the [[ref: holder]] when trying to generate a Non-Revocation Proof for this credential as part of an AnonCreds presentation.

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

* `c`: is a random number belonging in the group G2 $(Mod\ q)$
* `vr_prime_prime`: is also a random number belonging in the group G2 $(Mod\ q)$
* `sigma`: is calculated as
$$\sigma = (h_0h_1^{m_2}\ .\ u_r\ .\ g_i\ .\ h_2^{v_r''})^{\frac{1}{x+c}}$$
where $h_0$, $h_1$ are from revocation public key, $u_r$ is from the blinded credential secrets, $g_i = g^{\gamma^i}$ where $i$ is the issuer's accumulator index, $h_2$ is from revocation public key, and $x$ is from the revocation private key.
* `witness_signature`:
  * `sigma_i`: is calculated as $g'^{\frac{1}{sk+\gamma^i}}$
  * `u_i`: is $u^{\gamma^i}$
  * `g_i`: is a point in curve G1 which calculated by $g^{\gamma^i}$
* `g_i`: is a point in curve G1 which calculated by $g^{\gamma^i}$
* `i`: $i$ is the issuer's accumulator index
* `m2`: is the credential context which acts as a linkable identifier to the holder.

`rev_reg` is the following JSON data structure:

```json
"rev_reg": {
    "accum": "21 118...1FB"
}
```

The item in the data structure is:

* `accum`: is the accumulator value of the issuer which is updated with the new tails point as soon as new revocation credential is generated, and published to the public ledger.

`witness` is the following JSON data structure:

```json
"witness": {
    "omega": "21 124...AC8"
}
```

The item in the data structure is:

* `omega`: is calculated by $\prod\limits_{j \in V} g'_{L+1-j+i}$ where $V$ is the current set of non revoked indices and $L$ is the number of indices contained in the accumulator.

### Receiving a Credential

On receipt of a credential from an [[ref: issuer]], the [[ref: holder]] must
verify the credential and, if verified, will likely store the credential in a
secure location.

To verify the `signature_correctness_proof`, the [[ref: holder]] does the following:

- Verify that $e$ is a prime and lies within it's range.
- Compute 
$$ q \leftarrow \frac{Z}{S \prod\limits_{i in C_s} R_i^{m_i}} (Mod\ n)$$
- Verify $q = a^e (Mod\ n)$
- Compute $\hat{a} \leftarrow a^{c + s_e.e}(Mod\ n)$
- Verify $c' = H(q || a || \hat{a} || n_1)$

The verifying and securely storing of the credential by the [[ref: holder]]
completes the AnonCreds issuance process.

An AnonCreds credential is expected to be retained by the [[ref: holder]] that
participated in the issuance process. The [[ref: holder]] should not transfer
the credential to others for their use, and should only use the credential to
generate an AnonCreds verifiable presentation, as outlined in the
[AnonCreds Presentation](#anoncreds-presentation-data-flow) section of this specification.
