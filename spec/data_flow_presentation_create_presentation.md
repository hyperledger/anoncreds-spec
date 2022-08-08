### Generate Presentation

In step 3, 4, and 5 of the [AnonCreds Presentation Data
Flow](#anoncreds-presentation-data-flow), the Holder collects the required
information and creates the verifiable presentation according to the
[presentation request](#example-of-a-complete-presentation-request) received
from the Verifier.

Either a corresponding credential with optionally revealed attributes or a
self-attested attribute must be provided for each requested attribute. A
presentation request may request multiple credentials from different schemas and
multiple issuers, which should reside in the Holder's wallet.

The [[ref: verifier]] may specify in the presentation request that some or
all of the attributes/predicates that are derived from revocable verifiable credentials held by
the [[ref: holder]] have an accompanying non-revocation proof (NRP). The generation of an NRP
is described [in this section](#generate-non-revocation-proofs) of the specification.

::: note

Often in discussions about verifiable presentations, the term "[[ref: prover]]"
is used to indicate the participant generating the presentation.
Throughout the Hyperledger Indy AnonCreds implementation the term `prover` is
used in the names of methods performed by that participant. However, because
in AnonCreds the [[ref: holder]] and the [[ref: prover]] are always the same entity, we'll use
[[ref: holder]] to refer to the participant generating the requested presentation to
emphasize that the same entity is both issued credentials and generating
presentations from those credentials.

:::

#### Generate AnonCreds Presentation

Before the Holder can generate the proof, he needs to collect all required credentials from the Holder wallet
based on the provided presentation request. Instead of immediately returning fetched credentials, a three-step
procedure is used, first creating a `search_handle`, then fetching credentials in batches, and finally 
closing the request.

The holder then needs to create a `requested_credentials_json` document indicating the attributes and 
predicates to reveal. 

Finally, all required schemas, required public keys and revocation registries must be provided, 
typically by querying the verifiable data registry (VDR).

Once all required information is available, the Holder generates the presentation.

1. `indy_prover_search_credentials_for_proof_req`: This API call
    returns a `search_handle` that can be used to fetch records by small batches
    (with `indy_prover_fetch_credentials_for_proof_req`).

   ```rust
   pub extern fn indy_prover_search_credentials_for_proof_req(command_handle: CommandHandle,
                                                             wallet_handle: WalletHandle,
                                                             proof_request_json: *const c_char,
                                                             extra_query_json: *const c_char,
                                                             cb: Option<extern fn(
                                                                 command_handle_: CommandHandle, err: ErrorCode,
                                                                 search_handle: SearchHandle)>) -> ErrorCode {  
   ```

    * `wallet_handle`: Wallet handle (created by `open_wallet`).
    * `proof_request_json`: Proof request in JSON format.
    * `extra_query_json`: (Optional) list of extra queries that will be applied to the correspondent 
      attribute/predicate `<attr_referent>` /  `<predicate_referent>`, 
      see [wql_query](#wql-query-examples).
    
      * Example: 
  
          ```json
         {
              "attr1_referent": {
                  "attr::age::value": "28"
              }
         }
          ```

    * `cb`: Callback that takes command result as parameter.
    * `Returns` 
      * `search_handle`: Search handle that can be used later to fetch records by small batches 
      (with `indy_prover_fetch_credentials_for_proof_req`).


2. `indy_prover_fetch_credentials_for_proof_req`: This API call fetches the next batch of credentials of size `count` 
    for the requested item using proof request `search_handle` 
    (created by `indy_prover_search_credentials_for_proof_req`).
    ```rust
    pub  extern fn indy_prover_fetch_credentials_for_proof_req(command_handle: CommandHandle,
                                                           search_handle: SearchHandle,
                                                           item_referent: *const c_char,
                                                           count: usize,
                                                           cb: Option<extern fn(command_handle_: CommandHandle, err: ErrorCode,
                                                                                credentials_json: *const c_char)>) -> ErrorCode {} 
    ```
   * `search_handle`: Search handle (created by `indy_prover_search_credentials_for_proof_req`).
   * `item_referent`: Referent of attribute/predicate in the proof request.
   * `count`: Count of credentials to fetch.
   * `cb`: Callback that takes command result as parameter.
   * `Returns`
       * `credentials_json`: List of credentials for the given proof request.
         ```json
         [{
              "cred_info": <credential_info>,
              "interval": Optional<non_revoc_interval>
         }]
         ```

         where
         * `credential_info`:
            ```json
            {
                "referent": string, - id of credential in the wallet
                "attrs": {"key1":"raw_value1", "key2":"raw_value2"}, - credential attributes
                "schema_id": string, - identifier of schema
                "cred_def_id": string, - identifier of credential definition
                "rev_reg_id": Optional<string>, - identifier of revocation registry definition
                "cred_rev_id": Optional<string> - identifier of credential in the revocation registry definition
            }
            ```
             
         * `non_revoc_interval`:
             ```json
             {
                 "from": Optional<int>, - timestamp of interval beginning
                 "to": Optional<int>, - timestamp of interval ending
             }
             ```
         NOTE: If the length of the list is less than the requested `count`, then the search iterator
         correspondent to the requested `item_referent` is completed.  


3. `indy_prover_close_credentials_search_for_proof_req`: This API closes the credentials search 
    for the proof request (invalidate `search_handle`)

    ```rust
    pub  extern fn indy_prover_close_credentials_search_for_proof_req(command_handle: CommandHandle,
                                                                      search_handle: SearchHandle,
                                                                      cb: Option<extern fn(command_handle_: CommandHandle, err: ErrorCode)>) -> ErrorCode {
    ```
    * `search_handle`: Search handle (created by `indy_prover_search_credentials_for_proof_req`).
   

4. `requested_credentials_json`: The Holder defines how to reveal attributes and predicates. 
  Either a credential (`cred_id`) or a self-attested attribute for each requested attribute and predicate is
  provided in JSON format:

    ```json
    {
       "self_attested_attributes": {
           "self_attested_attribute_referent": string
       },
       "requested_attributes": {
           "requested_attribute_referent_1": {
              "cred_id": string, 
              "timestamp": Optional<number>, 
              "revealed": <bool> 
           },
           "requested_attribute_referent_2": {
              "cred_id": string, 
              "timestamp": Optional<number>, 
              "revealed": <bool> 
           }
       },
       "requested_predicates": {
           "requested_predicates_referent_1": {
               "cred_id": string,
               "timestamp": Optional<number>
           }
       }
    }
    ```
    
   Example: 
   ```json
   {
       "self_attested_attributes": {
           "attr1_referent": "Alice",
           "attr2_referent": "Garcia"
       },
       "requested_attributes": {
           "attr3_referent": {
               "cred_id": "123",
               "revealed": true
           },
           "attr4_referent": {
               "cred_id": "456",
               "revealed": true
           }
       },
       "requested_predicates": {
           "predicate1_referent": {
             "cred_id": "680"
           }
         }
   }
   ```

5. `indy_prover_create_proof`: This API creates a presentation according to the 
   [presentation request](#example-of-a-complete-presentation-request)
   * Either a corresponding credential with optionally revealed attributes or a self-attested attribute must be provided
     for each requested attribute (see `indy_prover_get_credentials_for_pool_req`).
   * A proof request may request multiple credentials from different schemas and different issuers.
   * All required schemas, public keys and revocation registries must be provided.
   * The proof request also contains nonce.
   * The proof contains either proof or self-attested attribute value for each requested attribute.
   
    ```rust
    pub extern fn indy_prover_create_proof(command_handle: CommandHandle,
                                           wallet_handle: WalletHandle,
                                           proof_request_json: *const c_char,
                                           requested_credentials_json: *const c_char,
                                           master_secret_id: *const c_char,
                                           schemas_json: *const c_char,
                                           credential_defs_json: *const c_char,
                                           rev_states_json: *const c_char,
                                           cb: Option<extern fn(command_handle_: CommandHandle, err: ErrorCode,
                                                                proof_json: *const c_char)>) -> ErrorCode {
    ```
   * `wallet_handle`: Wallet handle (created by `open_wallet`).
   * `proof_request_json`: Proof request in JSON format.
   * `requested_credentials_json`: Document specifying either a credential or self-attested 
      attribute for each requested attribute in JSON format.
   * `master_secret_id`: The id of the master secret stored in the wallet.
     * Notes: 
       * A Master Secret is an item of Private Data used by a Holder to guarantee that a credential uniquely applies to them. 
       * The Master Secret is an input that combines data from multiple Credentials to prove that the Credentials have a common subject (the Holder).
   * `schemas_json`: Collection of all schemas participating in the proof request.
     ```json
     {
         "schema1_id": <schema1>,
         "schema2_id": <schema2>,
         "schema3_id": <schema3>,
     }
     ```
   * `credential_defs_json`: Collection of all credential definitions participating in the proof request.
     ```json
     {
         "cred_def1_id": <credential_def1>,
         "cred_def2_id": <credential_def2>,
         "cred_def3_id": <credential_def3>,
     }
     ```
   * `rev_states_json`: Collection all revocation states participating in the proof request.
     ```json
     {
         "rev_reg_def1_id or credential_1_id": {
             "timestamp1": <rev_state1>,
             "timestamp2": <rev_state2>,
         },
         "rev_reg_def2_id or credential_1_id": {
             "timestamp3": <rev_state3>
         },
         "rev_reg_def3_id or credential_1_id": {
             "timestamp4": <rev_state4>
         },
     }
     ```
     
      Note: Use `credential_id` instead of `rev_reg_id` in case of proving several credentials from the same revocation registry.
   * `cb`: Callback that takes command result as parameter.
   * `Returns`
       * `proof_json`: Proof presentation for the given proof request.
         * For each requested attribute either a proof (with optionally revealed attribute value) or
          self-attested attribute value is provided.
         * Each proof is associated with a credential and corresponding `schema_id`, `cred_def_id`, `rev_reg_id` and `timestamp`.
         * There is also an aggregated proof part common for all credential proofs.
       
The resulting presentation `proof_json` created by the Holder has the following JSON format:

```json
{
    "requested_proof": {
        "revealed_attrs": {
            "requested_attr1_id": {
                "sub_proof_index": number,
                "raw": string,
                "encoded": string
            },
            "requested_attr4_id": {
                "sub_proof_index": number,
                "raw": string,
                "encoded": string
            }
        },
        "revealed_attr_groups": {
            "requested_attr5_id": {
                "sub_proof_index": number,
                "values": {
                    "attribute_name": {
                        "raw": string,
                        "encoded": string
                    }
                }
            }
        },
        "unrevealed_attrs": {
            "requested_attr3_id": {
                "sub_proof_index": number
            }
        },
        "self_attested_attrs": {
            "requested_attr2_id": self_attested_value
        },
        "predicates": {
            "requested_predicate_1_referent": {
                "sub_proof_index": int
            },
            "requested_predicate_2_referent": {
                "sub_proof_index": int
            }  
        }
    }
    "proof": {
        "proofs": [
            <credential_proof>,
            <credential_proof>,
            <credential_proof>
        ],
        "aggregated_proof": <aggregated_proof>
    }
    "identifiers": [{schema_id, cred_def_id, Optional<rev_reg_id>, Optional<timestamp>}]
}

```

##### Example of a proof:

```json
{
    "requested_proof": {
        "revealed_attrs": {
            "attr4_referent": {
                "sub_proof_index": 0,
                "raw": "graduated",
                "encoded": "2213454313412354"
            },
            "attr5_referent": {,
                "sub_proof_index": 0,
                "raw": "123-45-6789",
                "encoded": "3124141231422543541"
            },
            "attr3_referent": {
                "sub_proof_index": 0, 
                "raw": "Bachelor of Science, Marketing",
                "encoded": "12434523576212321"
            }
        },
        "self_attested_attrs": {
            "attr1_referent": "Alice",
            "attr2_referent": "Garcia",
            "attr6_referent": "123-45-6789"
        },
     "unrevealed_attrs": {
     },
     "predicates": {
          "predicate1_referent": {
              "sub_proof_index": 0
          }
     }
    "proof" : [] //# Validity Proof, to be checked by Verifier 
    "identifiers" : [ //# Identifiers of credentials that were used for Presentation building
        {
            "schema_id": "transcript_schema_id",
            "cred_def_id": "123",
            "rev_reg_id": "123_123",
            "timestamp": 1550503925
        },
        {
            "schema_id": "job_certificate_schema_id",
            "cred_def_id": "456",
            "rev_reg_id": "456_456",
            "timestamp": 1550503945
        }
    ]
}
```

#### Generate Non-Revocation Proofs

A [[ref: holder]] preparing an AnonCreds presentation must determine what, if
any, non-revocation proofs (NRPs) must be added to the presentation based on a
combination of what is in the proof request, and what verifiable credentials are
to be used in the presentation. As noted in the [previous
section](#verifier-revocation-interval-request), the presentation request may
have the `non-revoked` item at the outer-most level, applying to all source
credentials, or at the `requested_attribute` and/or `requested_predicate` level,
applying only to specific source credentials. For each, the [[ref: holder]] must
also determine if the verifiable credential selected for attributes/predicates
where a NRP is requested is a revocable credential. Obviously, a NRP cannot be
produced for a verifiable credential issued without a [[ref: RevReg]].

Once the [[ref: holder]] has determined the required NRPs needed for the
presentation, they must generate a NRP for each applicable source verifiable
credential and add the NRPs to the presentation. For each, the [[ref: holder]]
must collect the necessary data from the [[ref: RevRegEntry]]s
published by the [[ref: issuer]] and then generate the NRP.

#### Collecting Data for Generating the Non-Revocation Proof

In order to produce a NRP, the [[ref: holder]] must collect the following information from wherever the [[ref: issuer]]
has published the information. Note that the [[ref: holder]] may have some or all of this information cached
from data previously collected.

- The type of `issuance_type` of the [[ref: RevReg]] -- whether the initial state of the
  credentials in the registry is `active` or `revoked`. This information is part
  of the [[ref: RevReg]], and so likely cached by the [[ref: holder]] when they were first issued
  the credential.
- The tails file for [[ref: RevReg]], the location (a URL) of which is stored in
  the issued credential's [[ref: RevReg]]. The [[ref: holder]] likely (though
  not necessarily) would have collected the tails file at the time of issuance.
  Recall (from [this section of the
  specification](data_flow_setup.md#tails-file-and-tails-file-generation)) that
  the tails file for a [[ref: RevReg]] is generated at creation time and never
  changes.
- The index of the credential within the [[ref: RevReg]] for the [[ref: holder]]'s specific
  credential being used in the presentation. This information is given to the
  [[ref: holder]] by the [[ref: issuer]] when the verifiable credential is issued.
- The accumulator published by the [[ref: issuer]] for the [[ref: RevRegEntry]] that the [[ref: holder]]
  will use in generating the NRP. In the Hyperledger Indy implementation of
  AnonCreds, the entries are published as [[ref: RevRegEntry]]s on the ledger, and collected via a
  special request to the ledger (detailed below).
- The revocation status changes of all of the credential indices up to the
  publication of the accumulator that the [[ref: holder]] will use in generating the
  proof. Required is the collection of all of the `issued` and `revoked` lists
  (as described [here](#anoncreds-credential-revocation-and-publication)) from
  all of the [[ref: RevRegEntry]] publication requests made by the [[ref: issuer]] up to and
  including the request that includes the accumulator being used by the [[ref: holder]]
  in generating the NRP.

The collection of the last two items is difficult without extra support of the
entity holding the published [[ref: RevReg]] (e.g. the [[ref: VDR]]/ledger).
Since each [[ref: RevRegEntry]] holds only the list of `active` and `revoked`
credential revocation status changes since the previous [[ref: RevRegEntry]]
(the "deltas"), a [[ref: holder]] must retrieve those lists from every [[ref:
RevRegEntry]] from [[ref: RevReg]] creation to the [[ref: RevRegEntry]] holding
the accumulator the [[ref: holder]] will use for generating the NRP. The
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
cached lists. If the [[ref: verifier]] has requested a "back in time" NRP, the
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
credential for which the NRP is being generated has been revoked, and decide
to continue with the process (producing an unverifiable "proof") or to stop the
process, perhaps with a notification to the [[ref: verifier]].

##### Non-Revocation Proof Generation Steps

Given the data collected by the [[ref: holder]] to produce the NRP, the
following calculations are performed.

A `witness` is calculated in the same way as the accumulator (as described
[here](#publishing-the-initial-initial-revocation-registry-entry-object)),
except the tails file factor of the credential being proven as not revoked is
**not** included in the calculation. All of the tails file entries from the
other unrevoked credentials **are** included.

Once the witness (`u`), the accumulator from the ledger (`e`) and the value of
the tails file entry for the credential of interest (`b`) are known, the NRP can
be generated as follows:

::: todo

To Do: Add more detail about the calculation of `C`<sub>`u`</sub> and
`C`<sub>`b`</sub> in the following.

:::

* The [[ref: holder]] calculates `u*b = e`, where e is the accumulator.
* The [[ref: holder]] derives two values (in cryptograhic terms -
  [commitments](https://en.wikipedia.org/wiki/Commitment_scheme))
  `C`<sub>`u`</sub> and `C`<sub>`b`</sub> based on `u` and `b`.
* The [[ref: holder]] then calculates `T` from `C`<sub>`u`</sub> and
  `C`<sub>`b`</sub> and sends all three to the [[ref: verifier]].
* The [[ref: verifier]] uses `e` (the accumulator from the ledger),
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
