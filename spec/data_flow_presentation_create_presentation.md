#### Generate Presentation

In step 3, 4, and 5 of the [AnonCreds Presentation Data Flow](#anoncreds-presentation-data-flow), 
the Holder collects the required information and creates the verifiable presentation according to the
[presentation request](#example-of-a-complete-presentation-request) received from the Verifier.

Either a corresponding credential with optionally revealed attributes or a self-attested attribute must 
be provided for each requested attribute.
A presentation request may request multiple credentials from different schemas and multiple issuers,
which should reside in the Holder's wallet.

##### Protocol description

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
In step 6 of the [AnonCreds Presentation Data Flow](#anoncreds-presentation-data-flow), 
the Holder sends the verifiable presentation to the Verifier.


[Link: indy-anoncreds/docs/dev/anoncred.pdf](indy-anoncreds/docs/dev/anoncred.pdf)
