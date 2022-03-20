## AnonCreds Data Flows

This section of the specification describes the major data flows within AnonCreds:

* Setup, including operations by a Schema Creator (possibly the Issuer), Issuers and Holders
* Credential issuance, including operations by both the Issuer and Holder
* Present Proof, including operations by both the Verifier and the Holder

### AnonCreds Issuer Setup Data Flow

The following sequence diagram summarizes the the setup operations performed by a Schema Creator, the Issuer (one required and one optional) in preparing to issue a type of AnonCred credential, and the one setup operations performed by each Holder. On successfully completing the operations, the Issuer is able to issue credentials of the given type to the Holder. The subsections below the diagram detail each of the operations.

::: todo
Question: Should there be an operation to cover creating the published DID for the Issuer? If so, what about the DID of the Schema Creator.
:::

```mermaid
sequenceDiagram
    autonumber
    participant L as Verifiable Data Registry
    participant SC as Schema Creator
    participant I as Issuer
    participant H as Holder
    participant V as Verifier

    rect rgb(191, 223, 255)
    Note right of L: Schema Creator: Create and Publish Schema (Optional)
    end
        SC ->> L: indy_issuer_create_schema (<schema_id>, <schema_json>)
        L ->> SC: Schema Transaction ID
    rect rgb(191, 223, 255)
    Note right of L: Issuer: Create, Store and Publish CredDef
    end
        I ->> L: Request Schema
        L ->> I: Return Schema
        I ->> I: indy_issuer_create_and_store_credential_def (<schema>)
        Note right of I: store public/private keys and correctness proof
        I ->> L: Publish CredDef (<cred_def_id>, <cred_def_json>)
    rect rgb(191, 223, 255)
    Note right of L: Issuer: Create, Store and Publish Revocation Registry (Optional)
    end
        I ->> I: indy_issuer_create_and_store_revoc_reg
        Note right of I: get keys
        Note right of I: store revoc_reg_def, revoc_reg_accum, priv_key, tails_generator
        I ->> L: Publish RevReg (<revoc_reg_id>, <revoc_reg_def_json>, <revoc_reg_entry_json>)
    rect rgb(191, 223, 255)
    Note right of L: Holder: Create and Store Link Secret
    end
        H ->> H: indy_prover_create_master_secret
        H ->> H: store master secret
```

#### Schema Creator: Create and Publish Schema Object

```mermaid
sequenceDiagram
    autonumber
    participant L as Verifiable Data Registry
    participant SC as Schema Creator

    rect rgb(191, 223, 255)
    Note right of L: Schema Creator: Create and Publish Schema (Optional)
    end
        SC ->> L: indy_issuer_create_schema (<schema_id>, <schema_json>)
        L ->> SC: Schema Transaction ID

```

Each type of AnonCred credential is based on a published Schema object. The Schema object is defined and published by
a Schema Creator, who may be the Issuer of a given AnonCred credential type. This part of the specification covers the operation to create and publish the Schema.

The Schema object is a JSON structure that can be manually constructed, containing the list of attributes (claims) that will
be included in each AnonCred credential of this type and the items that will make up the `schema_id` for the Schema object.
The following is an example Schema object:

``` jsonc
{
    "attr_names": [
        "birthlocation",
        "facephoto",
        "expiry_date",
        "citizenship",
        "name",
        "birthdate",
        "firstname",
        "uuid"
    ],
    "name": "BasicIdentity",
    "version": "1.0.0"
}
```

* `attr_names` is the array of attribute names (claim names) that will constitute the AnonCred credential of this type.
* `name` is a string, the name of the schema, which will be a part of the published `schema_id`.
* `version` is a string, the version of the schema in [semver](https://semver.org/) format. The three part, period (".")
    separated format MAY be enforced. The `version` will be part of the published `schema_id`.

The `name` and `version` items are used to create a schema_id for the Schema. The `schema_id` is namespaced by the creator of the Schema,
as follows: `<creator DID>:<object type>:<name>:version>`. The elements of the identifier, separated by `:` are:

* `creator DID`: The DID of the creator of the schema.
* `object type`: The type of object. `2` is used for the Schema Object.
* `name`: The `name` item from the `schema_json` object as defined above.
* `version`: The `version` item from the `schema_json` object as defined above.

Once constructed, the schema_id and schema_json are published to a Verifiable Data Registry, a Hyperledger Indy ledger. For example, see [this
schema](https://indyscan.io/tx/SOVRIN_MAINNET/domain/73904) that has been published on the Sovrin MainNet ledger. Once published, an
additional identifier for the published schema, the `TXN_ID` is available to issuers and is used as part of the CredDef identifier
created as the next step in the process (see the next subsection).

#### Issuer Create and Publish CredDef Object

#### Issuer Create and Publish Revocation Registry Object

#### Holder Create and Store Link Secret
