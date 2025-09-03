# Supabase Database Schema (API Dump)
Generated: 2025-09-03T10:21:26.839Z
Project: jizobmpcyrzprrwsyedv

## Tables and Columns

### auth.audit_log_entries

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| instance_id | uuid | YES | NULL |
| id | uuid | NO | NULL |
| payload | json | YES | NULL |
| created_at | timestamp with time zone | YES | NULL |
| ip_address | character varying(64) | NO | ''::character varying |

### auth.flow_state

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | NULL |
| user_id | uuid | YES | NULL |
| auth_code | text | NO | NULL |
| code_challenge_method | USER-DEFINED | NO | NULL |
| code_challenge | text | NO | NULL |
| provider_type | text | NO | NULL |
| provider_access_token | text | YES | NULL |
| provider_refresh_token | text | YES | NULL |
| created_at | timestamp with time zone | YES | NULL |
| updated_at | timestamp with time zone | YES | NULL |
| authentication_method | text | NO | NULL |
| auth_code_issued_at | timestamp with time zone | YES | NULL |

### auth.identities

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| provider_id | text | NO | NULL |
| user_id | uuid | NO | NULL |
| identity_data | jsonb | NO | NULL |
| provider | text | NO | NULL |
| last_sign_in_at | timestamp with time zone | YES | NULL |
| created_at | timestamp with time zone | YES | NULL |
| updated_at | timestamp with time zone | YES | NULL |
| email | text | YES | NULL |
| id | uuid | NO | gen_random_uuid() |

### auth.instances

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | NULL |
| uuid | uuid | YES | NULL |
| raw_base_config | text | YES | NULL |
| created_at | timestamp with time zone | YES | NULL |
| updated_at | timestamp with time zone | YES | NULL |

### auth.mfa_amr_claims

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| session_id | uuid | NO | NULL |
| created_at | timestamp with time zone | NO | NULL |
| updated_at | timestamp with time zone | NO | NULL |
| authentication_method | text | NO | NULL |
| id | uuid | NO | NULL |

### auth.mfa_challenges

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | NULL |
| factor_id | uuid | NO | NULL |
| created_at | timestamp with time zone | NO | NULL |
| verified_at | timestamp with time zone | YES | NULL |
| ip_address | inet | NO | NULL |
| otp_code | text | YES | NULL |
| web_authn_session_data | jsonb | YES | NULL |

### auth.mfa_factors

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | NULL |
| user_id | uuid | NO | NULL |
| friendly_name | text | YES | NULL |
| factor_type | USER-DEFINED | NO | NULL |
| status | USER-DEFINED | NO | NULL |
| created_at | timestamp with time zone | NO | NULL |
| updated_at | timestamp with time zone | NO | NULL |
| secret | text | YES | NULL |
| phone | text | YES | NULL |
| last_challenged_at | timestamp with time zone | YES | NULL |
| web_authn_credential | jsonb | YES | NULL |
| web_authn_aaguid | uuid | YES | NULL |

### auth.oauth_clients

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | NULL |
| client_id | text | NO | NULL |
| client_secret_hash | text | NO | NULL |
| registration_type | USER-DEFINED | NO | NULL |
| redirect_uris | text | NO | NULL |
| grant_types | text | NO | NULL |
| client_name | text | YES | NULL |
| client_uri | text | YES | NULL |
| logo_uri | text | YES | NULL |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |
| deleted_at | timestamp with time zone | YES | NULL |

### auth.one_time_tokens

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | NULL |
| user_id | uuid | NO | NULL |
| token_type | USER-DEFINED | NO | NULL |
| token_hash | text | NO | NULL |
| relates_to | text | NO | NULL |
| created_at | timestamp without time zone | NO | now() |
| updated_at | timestamp without time zone | NO | now() |

### auth.refresh_tokens

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| instance_id | uuid | YES | NULL |
| id | bigint(64) | NO | nextval('auth.refresh_tokens_id_seq'::regclass) |
| token | character varying(255) | YES | NULL |
| user_id | character varying(255) | YES | NULL |
| revoked | boolean | YES | NULL |
| created_at | timestamp with time zone | YES | NULL |
| updated_at | timestamp with time zone | YES | NULL |
| parent | character varying(255) | YES | NULL |
| session_id | uuid | YES | NULL |

### auth.saml_providers

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | NULL |
| sso_provider_id | uuid | NO | NULL |
| entity_id | text | NO | NULL |
| metadata_xml | text | NO | NULL |
| metadata_url | text | YES | NULL |
| attribute_mapping | jsonb | YES | NULL |
| created_at | timestamp with time zone | YES | NULL |
| updated_at | timestamp with time zone | YES | NULL |
| name_id_format | text | YES | NULL |

### auth.saml_relay_states

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | NULL |
| sso_provider_id | uuid | NO | NULL |
| request_id | text | NO | NULL |
| for_email | text | YES | NULL |
| redirect_to | text | YES | NULL |
| created_at | timestamp with time zone | YES | NULL |
| updated_at | timestamp with time zone | YES | NULL |
| flow_state_id | uuid | YES | NULL |

### auth.schema_migrations

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| version | character varying(255) | NO | NULL |

### auth.sessions

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | NULL |
| user_id | uuid | NO | NULL |
| created_at | timestamp with time zone | YES | NULL |
| updated_at | timestamp with time zone | YES | NULL |
| factor_id | uuid | YES | NULL |
| aal | USER-DEFINED | YES | NULL |
| not_after | timestamp with time zone | YES | NULL |
| refreshed_at | timestamp without time zone | YES | NULL |
| user_agent | text | YES | NULL |
| ip | inet | YES | NULL |
| tag | text | YES | NULL |

### auth.sso_domains

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | NULL |
| sso_provider_id | uuid | NO | NULL |
| domain | text | NO | NULL |
| created_at | timestamp with time zone | YES | NULL |
| updated_at | timestamp with time zone | YES | NULL |

### auth.sso_providers

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | NULL |
| resource_id | text | YES | NULL |
| created_at | timestamp with time zone | YES | NULL |
| updated_at | timestamp with time zone | YES | NULL |
| disabled | boolean | YES | NULL |

### auth.users

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| instance_id | uuid | YES | NULL |
| id | uuid | NO | NULL |
| aud | character varying(255) | YES | NULL |
| role | character varying(255) | YES | NULL |
| email | character varying(255) | YES | NULL |
| encrypted_password | character varying(255) | YES | NULL |
| email_confirmed_at | timestamp with time zone | YES | NULL |
| invited_at | timestamp with time zone | YES | NULL |
| confirmation_token | character varying(255) | YES | NULL |
| confirmation_sent_at | timestamp with time zone | YES | NULL |
| recovery_token | character varying(255) | YES | NULL |
| recovery_sent_at | timestamp with time zone | YES | NULL |
| email_change_token_new | character varying(255) | YES | NULL |
| email_change | character varying(255) | YES | NULL |
| email_change_sent_at | timestamp with time zone | YES | NULL |
| last_sign_in_at | timestamp with time zone | YES | NULL |
| raw_app_meta_data | jsonb | YES | NULL |
| raw_user_meta_data | jsonb | YES | NULL |
| is_super_admin | boolean | YES | NULL |
| created_at | timestamp with time zone | YES | NULL |
| updated_at | timestamp with time zone | YES | NULL |
| phone | text | YES | NULL::character varying |
| phone_confirmed_at | timestamp with time zone | YES | NULL |
| phone_change | text | YES | ''::character varying |
| phone_change_token | character varying(255) | YES | ''::character varying |
| phone_change_sent_at | timestamp with time zone | YES | NULL |
| confirmed_at | timestamp with time zone | YES | NULL |
| email_change_token_current | character varying(255) | YES | ''::character varying |
| email_change_confirm_status | smallint(16) | YES | 0 |
| banned_until | timestamp with time zone | YES | NULL |
| reauthentication_token | character varying(255) | YES | ''::character varying |
| reauthentication_sent_at | timestamp with time zone | YES | NULL |
| is_sso_user | boolean | NO | false |
| deleted_at | timestamp with time zone | YES | NULL |
| is_anonymous | boolean | NO | false |

### public.analytics_events

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| store_id | uuid | NO | NULL |
| event_name | character varying(100) | NO | NULL |
| event_category | character varying(50) | YES | NULL |
| parameters | jsonb | YES | '{}'::jsonb |
| user_id | uuid | YES | NULL |
| session_id | character varying(100) | YES | NULL |
| visitor_id | character varying(100) | YES | NULL |
| timestamp | timestamp with time zone | YES | now() |
| source | character varying(20) | NO | NULL |
| ip_address | inet | YES | NULL |
| user_agent | text | YES | NULL |
| referrer | text | YES | NULL |
| utm_source | character varying(100) | YES | NULL |
| utm_medium | character varying(100) | YES | NULL |
| utm_campaign | character varying(100) | YES | NULL |
| utm_term | character varying(100) | YES | NULL |
| utm_content | character varying(100) | YES | NULL |
| page_url | text | YES | NULL |
| page_title | text | YES | NULL |
| device_type | character varying(20) | YES | NULL |
| browser | character varying(50) | YES | NULL |
| os | character varying(50) | YES | NULL |
| country | character varying(2) | YES | NULL |
| region | character varying(100) | YES | NULL |
| city | character varying(100) | YES | NULL |

### public.attribution_touchpoints

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| store_id | uuid | NO | NULL |
| customer_id | uuid | YES | NULL |
| session_id | character varying(100) | YES | NULL |
| channel | character varying(50) | NO | NULL |
| source | character varying(100) | YES | NULL |
| medium | character varying(50) | YES | NULL |
| campaign | character varying(100) | YES | NULL |
| content | character varying(100) | YES | NULL |
| term | character varying(100) | YES | NULL |
| position_in_journey | integer(32) | YES | NULL |
| time_to_conversion | integer(32) | YES | NULL |
| value_contribution | numeric(10,2) | YES | 0 |
| attribution_model | character varying(20) | YES | NULL |
| converted | boolean | YES | false |
| order_id | uuid | YES | NULL |
| conversion_value | numeric(10,2) | YES | 0 |
| touched_at | timestamp with time zone | YES | now() |

### public.campaign_enrollments

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| campaign_id | uuid | NO | NULL |
| lead_id | uuid | YES | NULL |
| incomplete_order_id | uuid | YES | NULL |
| customer_email | character varying(255) | NO | NULL |
| current_step | integer(32) | YES | 1 |
| enrolled_at | timestamp with time zone | YES | now() |
| completed_at | timestamp with time zone | YES | NULL |
| status | character varying(50) | YES | 'active'::character varying |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.campaign_recipients

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| campaign_id | uuid | NO | NULL |
| customer_email | character varying(255) | NO | NULL |
| customer_name | character varying(255) | YES | NULL |
| customer_id | uuid | YES | NULL |
| segment_id | uuid | YES | NULL |
| personalization_data | jsonb | YES | NULL |
| status | character varying(50) | YES | 'pending'::character varying |
| sent_at | timestamp with time zone | YES | NULL |
| delivered_at | timestamp with time zone | YES | NULL |
| opened_at | timestamp with time zone | YES | NULL |
| first_clicked_at | timestamp with time zone | YES | NULL |
| last_clicked_at | timestamp with time zone | YES | NULL |
| bounced_at | timestamp with time zone | YES | NULL |
| bounce_reason | text | YES | NULL |
| unsubscribed_at | timestamp with time zone | YES | NULL |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.campaign_step_executions

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| enrollment_id | uuid | NO | NULL |
| step_id | uuid | NO | NULL |
| scheduled_at | timestamp with time zone | YES | NULL |
| sent_at | timestamp with time zone | YES | NULL |
| opened_at | timestamp with time zone | YES | NULL |
| clicked_at | timestamp with time zone | YES | NULL |
| status | character varying(50) | YES | 'scheduled'::character varying |
| error_message | text | YES | NULL |
| created_at | timestamp with time zone | YES | now() |

### public.cart_events

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| store_id | uuid | NO | NULL |
| customer_id | uuid | YES | NULL |
| session_id | text | NO | NULL |
| event_type | text | NO | NULL |
| product_id | uuid | YES | NULL |
| quantity | integer(32) | YES | 1 |
| price | numeric(10,2) | YES | NULL |
| metadata | jsonb | YES | '{}'::jsonb |
| created_at | timestamp with time zone | YES | now() |

### public.cart_items

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | uuid_generate_v4() |
| store_id | uuid | NO | NULL |
| customer_id | uuid | YES | NULL |
| session_id | character varying(255) | YES | NULL |
| product_id | uuid | NO | NULL |
| quantity | integer(32) | NO | 1 |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.categories

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | uuid_generate_v4() |
| store_id | uuid | NO | NULL |
| name | character varying(255) | NO | NULL |
| description | text | YES | NULL |
| is_active | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.customer_addresses

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | uuid_generate_v4() |
| customer_id | uuid | NO | NULL |
| address_type | character varying(50) | YES | 'shipping'::character varying |
| first_name | character varying(100) | YES | NULL |
| last_name | character varying(100) | YES | NULL |
| company | character varying(255) | YES | NULL |
| address_line_1 | character varying(255) | NO | NULL |
| address_line_2 | character varying(255) | YES | NULL |
| city | character varying(100) | NO | NULL |
| state | character varying(100) | YES | NULL |
| postal_code | character varying(20) | NO | NULL |
| country | character varying(100) | NO | NULL |
| phone | character varying(20) | YES | NULL |
| is_default | boolean | YES | false |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.customer_analytics

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| customer_id | uuid | NO | NULL |
| store_id | uuid | NO | NULL |
| recency_score | integer(32) | YES | NULL |
| frequency_score | integer(32) | YES | NULL |
| monetary_score | integer(32) | YES | NULL |
| rfm_segment | character varying(20) | YES | NULL |
| total_sessions | integer(32) | YES | 0 |
| avg_session_duration | numeric(10,2) | YES | 0 |
| bounce_rate | numeric(5,2) | YES | 0 |
| pages_per_session | numeric(5,2) | YES | 0 |
| email_engagement_score | numeric(5,2) | YES | 0 |
| sms_engagement_score | numeric(5,2) | YES | 0 |
| social_engagement_score | numeric(5,2) | YES | 0 |
| churn_probability | numeric(5,2) | YES | 0 |
| lifetime_value_prediction | numeric(10,2) | YES | 0 |
| next_purchase_probability | numeric(5,2) | YES | 0 |
| avg_order_value | numeric(10,2) | YES | 0 |
| total_orders | integer(32) | YES | 0 |
| total_spent | numeric(10,2) | YES | 0 |
| days_since_last_order | integer(32) | YES | NULL |
| preferred_category | character varying(100) | YES | NULL |
| preferred_payment_method | character varying(50) | YES | NULL |
| first_purchase_date | timestamp with time zone | YES | NULL |
| last_purchase_date | timestamp with time zone | YES | NULL |
| calculated_at | timestamp with time zone | YES | now() |

### public.customer_favorites

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| store_id | uuid | NO | NULL |
| customer_id | uuid | NO | NULL |
| product_id | uuid | NO | NULL |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.customer_leads

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| store_id | uuid | NO | NULL |
| email | character varying(255) | NO | NULL |
| first_name | character varying(100) | YES | NULL |
| last_name | character varying(100) | YES | NULL |
| phone | character varying(50) | YES | NULL |
| lead_source_id | uuid | YES | NULL |
| lead_score | integer(32) | YES | 0 |
| status | character varying(50) | YES | 'new'::character varying |
| tags | ARRAY | YES | NULL |
| notes | text | YES | NULL |
| last_interaction_at | timestamp with time zone | YES | NULL |
| converted_at | timestamp with time zone | YES | NULL |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.customer_segment_memberships

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| segment_id | uuid | NO | NULL |
| customer_id | uuid | NO | NULL |
| added_at | timestamp with time zone | YES | now() |
| score | numeric(5,2) | YES | NULL |

### public.customer_segments

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| store_id | uuid | NO | NULL |
| name | character varying(255) | NO | NULL |
| description | text | YES | NULL |
| segment_criteria | jsonb | NO | NULL |
| is_dynamic | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.customer_sessions

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| store_id | uuid | NO | NULL |
| customer_id | uuid | YES | NULL |
| session_id | text | NO | NULL |
| device_type | text | YES | NULL |
| browser | text | YES | NULL |
| page_views | integer(32) | YES | 0 |
| total_time | integer(32) | YES | 0 |
| converted | boolean | YES | false |
| referrer | text | YES | NULL |
| utm_source | text | YES | NULL |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.customer_testimonials

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| store_id | uuid | NO | NULL |
| customer_name | text | NO | NULL |
| rating | integer(32) | NO | NULL |
| comment | text | NO | NULL |
| customer_image_url | text | YES | NULL |
| is_active | boolean | YES | true |
| display_order | integer(32) | YES | 1 |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.customers

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | uuid_generate_v4() |
| store_id | uuid | NO | NULL |
| email | character varying(255) | NO | NULL |
| google_id | character varying(255) | YES | NULL |
| apple_id | character varying(255) | YES | NULL |
| first_name | character varying(100) | YES | NULL |
| last_name | character varying(100) | YES | NULL |
| phone | character varying(20) | YES | NULL |
| date_of_birth | date | YES | NULL |
| is_active | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| billing_address_line1 | text | YES | NULL |
| billing_address_line2 | text | YES | NULL |
| billing_city | text | YES | NULL |
| billing_state | text | YES | NULL |
| billing_postal_code | text | YES | NULL |
| billing_country | text | YES | 'US'::text |
| shipping_address_line1 | text | YES | NULL |
| shipping_address_line2 | text | YES | NULL |
| shipping_city | text | YES | NULL |
| shipping_state | text | YES | NULL |
| shipping_postal_code | text | YES | NULL |
| shipping_country | text | YES | 'US'::text |
| billing_different_from_shipping | boolean | YES | false |

### public.delivery_areas

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| store_id | uuid | NO | NULL |
| name | character varying(255) | NO | NULL |
| description | text | YES | NULL |
| area_type | character varying(50) | NO | NULL |
| coordinates | jsonb | YES | NULL |
| postal_codes | ARRAY | YES | NULL |
| cities | ARRAY | YES | NULL |
| delivery_fee | numeric(10,2) | YES | 0.00 |
| free_delivery_threshold | numeric(10,2) | YES | NULL |
| estimated_delivery_time_min | integer(32) | YES | NULL |
| estimated_delivery_time_max | integer(32) | YES | NULL |
| is_active | boolean | YES | true |
| max_orders_per_day | integer(32) | YES | NULL |
| operating_hours | jsonb | YES | NULL |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.delivery_exclusions

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| delivery_area_id | uuid | NO | NULL |
| name | character varying(255) | NO | NULL |
| coordinates | jsonb | NO | NULL |
| reason | text | YES | NULL |
| created_at | timestamp with time zone | YES | now() |

### public.delivery_time_slots

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| delivery_area_id | uuid | NO | NULL |
| day_of_week | integer(32) | NO | NULL |
| start_time | time without time zone | NO | NULL |
| end_time | time without time zone | NO | NULL |
| max_orders | integer(32) | YES | 10 |
| is_available | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |

### public.email_ab_tests

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| campaign_id | uuid | NO | NULL |
| test_name | character varying(255) | NO | NULL |
| test_type | character varying(50) | NO | NULL |
| variant_a | jsonb | NO | NULL |
| variant_b | jsonb | NO | NULL |
| traffic_split | integer(32) | YES | 50 |
| winner_criteria | character varying(50) | YES | 'open_rate'::character varying |
| test_duration_hours | integer(32) | YES | 24 |
| status | character varying(50) | YES | 'running'::character varying |
| winner_variant | character(1) | YES | NULL |
| results | jsonb | YES | NULL |
| created_at | timestamp with time zone | YES | now() |
| completed_at | timestamp with time zone | YES | NULL |

### public.email_campaigns

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| store_id | uuid | NO | NULL |
| name | character varying(255) | NO | NULL |
| description | text | YES | NULL |
| campaign_type | character varying(50) | NO | NULL |
| status | character varying(50) | YES | 'draft'::character varying |
| template_id | uuid | YES | NULL |
| subject_line | character varying(255) | NO | NULL |
| preview_text | character varying(255) | YES | NULL |
| html_content | text | YES | NULL |
| plain_text_content | text | YES | NULL |
| sender_name | character varying(255) | NO | NULL |
| sender_email | character varying(255) | NO | NULL |
| reply_to_email | character varying(255) | YES | NULL |
| target_audience | jsonb | NO | NULL |
| estimated_recipients | integer(32) | YES | 0 |
| send_immediately | boolean | YES | false |
| scheduled_at | timestamp with time zone | YES | NULL |
| timezone | character varying(50) | YES | 'UTC'::character varying |
| total_sent | integer(32) | YES | 0 |
| total_delivered | integer(32) | YES | 0 |
| total_opened | integer(32) | YES | 0 |
| total_clicked | integer(32) | YES | 0 |
| total_unsubscribed | integer(32) | YES | 0 |
| total_bounced | integer(32) | YES | 0 |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.email_click_tracking

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| campaign_id | uuid | NO | NULL |
| recipient_id | uuid | NO | NULL |
| link_url | text | NO | NULL |
| link_label | character varying(255) | YES | NULL |
| clicked_at | timestamp with time zone | YES | now() |
| ip_address | inet | YES | NULL |
| user_agent | text | YES | NULL |

### public.email_segments

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| store_id | uuid | NO | NULL |
| name | character varying(255) | NO | NULL |
| description | text | YES | NULL |
| segment_type | character varying(50) | NO | NULL |
| criteria | jsonb | NO | NULL |
| is_dynamic | boolean | YES | true |
| member_count | integer(32) | YES | 0 |
| last_calculated_at | timestamp with time zone | YES | NULL |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.email_templates

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| store_id | uuid | YES | NULL |
| name | character varying(255) | NO | NULL |
| description | text | YES | NULL |
| category | character varying(100) | NO | NULL |
| template_type | character varying(50) | NO | NULL |
| subject_line | character varying(255) | NO | NULL |
| preview_text | character varying(255) | YES | NULL |
| html_content | text | YES | NULL |
| plain_text_content | text | YES | NULL |
| template_variables | jsonb | YES | NULL |
| design_config | jsonb | YES | NULL |
| is_global | boolean | YES | false |
| is_active | boolean | YES | true |
| usage_count | integer(32) | YES | 0 |
| created_by | uuid | YES | NULL |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.email_unsubscribes

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| store_id | uuid | NO | NULL |
| email | character varying(255) | NO | NULL |
| unsubscribe_type | character varying(50) | YES | 'all'::character varying |
| campaign_id | uuid | YES | NULL |
| reason | character varying(255) | YES | NULL |
| unsubscribed_at | timestamp with time zone | YES | now() |

### public.incomplete_orders

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| store_id | uuid | NO | NULL |
| customer_email | character varying(255) | NO | NULL |
| customer_name | character varying(255) | YES | NULL |
| cart_data | jsonb | NO | NULL |
| total_amount | numeric(10,2) | YES | NULL |
| abandoned_at | timestamp with time zone | YES | now() |
| last_reminder_sent_at | timestamp with time zone | YES | NULL |
| recovery_attempts | integer(32) | YES | 0 |
| recovered | boolean | YES | false |
| recovered_at | timestamp with time zone | YES | NULL |
| recovery_order_id | uuid | YES | NULL |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.inventory_alerts

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| store_id | uuid | NO | NULL |
| product_id | uuid | NO | NULL |
| alert_type | character varying(50) | NO | NULL |
| threshold_value | integer(32) | YES | NULL |
| current_value | integer(32) | YES | NULL |
| alert_message | text | NO | NULL |
| is_acknowledged | boolean | YES | false |
| acknowledged_by | uuid | YES | NULL |
| acknowledged_at | timestamp with time zone | YES | NULL |
| created_at | timestamp with time zone | YES | now() |
| resolved_at | timestamp with time zone | YES | NULL |

### public.inventory_history

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| product_id | uuid | NO | NULL |
| store_id | uuid | NO | NULL |
| change_type | character varying(50) | NO | NULL |
| quantity_change | integer(32) | NO | NULL |
| previous_quantity | integer(32) | NO | NULL |
| new_quantity | integer(32) | NO | NULL |
| cost_per_unit | numeric(10,2) | YES | NULL |
| total_cost | numeric(10,2) | YES | NULL |
| reference_id | uuid | YES | NULL |
| reference_type | character varying(50) | YES | NULL |
| notes | text | YES | NULL |
| created_by | uuid | YES | NULL |
| created_at | timestamp with time zone | YES | now() |

### public.inventory_locations

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| store_id | uuid | NO | NULL |
| name | character varying(255) | NO | NULL |
| description | text | YES | NULL |
| address | text | YES | NULL |
| is_default | boolean | YES | false |
| is_active | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.inventory_settings

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| store_id | uuid | NO | NULL |
| low_stock_threshold | integer(32) | YES | 10 |
| out_of_stock_threshold | integer(32) | YES | 0 |
| overstock_threshold | integer(32) | YES | 1000 |
| enable_low_stock_alerts | boolean | YES | true |
| enable_out_of_stock_alerts | boolean | YES | true |
| enable_overstock_alerts | boolean | YES | false |
| auto_update_from_orders | boolean | YES | true |
| track_inventory_cost | boolean | YES | true |
| default_reorder_quantity | integer(32) | YES | 50 |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.lead_activities

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| lead_id | uuid | NO | NULL |
| activity_type | character varying(100) | NO | NULL |
| activity_data | jsonb | YES | NULL |
| score_impact | integer(32) | YES | 0 |
| created_at | timestamp with time zone | YES | now() |

### public.lead_sources

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| name | character varying(100) | NO | NULL |
| description | text | YES | NULL |
| store_id | uuid | YES | NULL |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.marketing_campaigns

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| store_id | uuid | NO | NULL |
| name | character varying(200) | NO | NULL |
| description | text | YES | NULL |
| campaign_type | character varying(50) | NO | NULL |
| channel | character varying(50) | NO | NULL |
| status | character varying(20) | YES | 'draft'::character varying |
| target_segment_ids | ARRAY | YES | NULL |
| target_criteria | jsonb | YES | NULL |
| budget | numeric(10,2) | YES | NULL |
| budget_type | character varying(20) | YES | NULL |
| start_date | timestamp with time zone | YES | NULL |
| end_date | timestamp with time zone | YES | NULL |
| subject_line | character varying(200) | YES | NULL |
| content_template_id | uuid | YES | NULL |
| content_data | jsonb | YES | NULL |
| utm_source | character varying(100) | YES | NULL |
| utm_medium | character varying(100) | YES | NULL |
| utm_campaign | character varying(100) | YES | NULL |
| utm_term | character varying(100) | YES | NULL |
| utm_content | character varying(100) | YES | NULL |
| sent_count | integer(32) | YES | 0 |
| delivered_count | integer(32) | YES | 0 |
| opened_count | integer(32) | YES | 0 |
| clicked_count | integer(32) | YES | 0 |
| conversion_count | integer(32) | YES | 0 |
| revenue_generated | numeric(10,2) | YES | 0 |
| cost_spent | numeric(10,2) | YES | 0 |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.nurture_campaign_steps

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| campaign_id | uuid | NO | NULL |
| step_order | integer(32) | NO | NULL |
| step_name | character varying(255) | NO | NULL |
| delay_hours | integer(32) | YES | 24 |
| email_subject | character varying(255) | YES | NULL |
| email_content | text | YES | NULL |
| email_template | character varying(100) | YES | NULL |
| is_active | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.nurture_campaigns

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| store_id | uuid | YES | NULL |
| name | character varying(255) | NO | NULL |
| description | text | YES | NULL |
| campaign_type | character varying(50) | NO | NULL |
| trigger_conditions | jsonb | YES | NULL |
| is_global | boolean | YES | false |
| is_active | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.order_items

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | uuid_generate_v4() |
| order_id | uuid | NO | NULL |
| product_id | uuid | NO | NULL |
| product_name | character varying(255) | NO | NULL |
| product_sku | character varying(100) | YES | NULL |
| quantity | integer(32) | NO | NULL |
| unit_price | numeric(10,2) | NO | NULL |
| total_price | numeric(10,2) | NO | NULL |
| created_at | timestamp with time zone | YES | now() |

### public.orders

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | uuid_generate_v4() |
| store_id | uuid | NO | NULL |
| customer_id | uuid | NO | NULL |
| order_number | character varying(50) | NO | NULL |
| status | USER-DEFINED | YES | 'pending'::order_status |
| subtotal | numeric(10,2) | NO | NULL |
| tax_amount | numeric(10,2) | YES | 0 |
| shipping_amount | numeric(10,2) | YES | 0 |
| discount_amount | numeric(10,2) | YES | 0 |
| total_amount | numeric(10,2) | NO | NULL |
| currency | character varying(3) | YES | 'USD'::character varying |
| notes | text | YES | NULL |
| shipping_address | jsonb | YES | NULL |
| billing_address | jsonb | YES | NULL |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| payment_status | character varying(50) | YES | 'unpaid'::character varying |
| stripe_payment_intent_id | character varying(255) | YES | NULL |
| payment_link_url | text | YES | NULL |
| payment_link_expires_at | timestamp with time zone | YES | NULL |
| shipping | numeric(10,2) | YES | 0 |
| tax | numeric(10,2) | YES | 0 |
| total | numeric(10,2) | YES | 0 |

### public.page_documents

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| store_id | uuid | NO | NULL |
| name | text | NO | NULL |
| slug | text | YES | NULL |
| version | integer(32) | YES | 1 |
| status | text | YES | 'draft'::text |
| published_at | timestamp with time zone | YES | NULL |
| scheduled_for | timestamp with time zone | YES | NULL |
| sections | jsonb | NO | '[]'::jsonb |
| theme_overrides | jsonb | YES | '{}'::jsonb |
| seo | jsonb | YES | '{}'::jsonb |
| analytics | jsonb | YES | '{}'::jsonb |
| performance | jsonb | YES | '{}'::jsonb |
| accessibility | jsonb | YES | '{}'::jsonb |
| custom_code | jsonb | YES | '{}'::jsonb |
| global_styles | jsonb | YES | '{}'::jsonb |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| isSystemPage | boolean | YES | false |
| systemPageType | text | YES | NULL |
| editingRestrictions | jsonb | YES | NULL |
| navigation_placement | text | YES | 'both'::text |
| page_type | text | YES | 'page'::text |

### public.page_history

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| page_id | uuid | NO | NULL |
| version | integer(32) | NO | NULL |
| author_id | uuid | NO | NULL |
| note | text | YES | NULL |
| snapshot | jsonb | NO | NULL |
| created_at | timestamp with time zone | YES | now() |

### public.page_templates

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| name | text | NO | NULL |
| description | text | YES | NULL |
| thumbnail | text | YES | NULL |
| category | text | YES | 'custom'::text |
| document | jsonb | NO | NULL |
| is_public | boolean | YES | false |
| created_by | uuid | YES | NULL |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.page_views

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| store_id | uuid | NO | NULL |
| customer_id | uuid | YES | NULL |
| session_id | text | NO | NULL |
| page_path | text | NO | NULL |
| page_title | text | YES | NULL |
| referrer | text | YES | NULL |
| user_agent | text | YES | NULL |
| device_type | text | YES | NULL |
| browser | text | YES | NULL |
| ip_address | inet | YES | NULL |
| country_code | text | YES | NULL |
| city | text | YES | NULL |
| created_at | timestamp with time zone | YES | now() |

### public.payments

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | uuid_generate_v4() |
| order_id | uuid | NO | NULL |
| amount | numeric(10,2) | NO | NULL |
| currency | character varying(3) | YES | 'USD'::character varying |
| payment_method | character varying(50) | NO | NULL |
| payment_status | USER-DEFINED | YES | 'pending'::payment_status |
| stripe_payment_intent_id | character varying(255) | YES | NULL |
| stripe_charge_id | character varying(255) | YES | NULL |
| transaction_id | character varying(255) | YES | NULL |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.predefined_segments

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| name | character varying(255) | NO | NULL |
| description | text | YES | NULL |
| segment_criteria | jsonb | NO | NULL |
| is_system | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |

### public.product_analytics

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| product_id | uuid | NO | NULL |
| store_id | uuid | NO | NULL |
| total_views | integer(32) | YES | 0 |
| unique_views | integer(32) | YES | 0 |
| views_to_cart_rate | numeric(5,2) | YES | 0 |
| cart_to_purchase_rate | numeric(5,2) | YES | 0 |
| total_sales | integer(32) | YES | 0 |
| total_revenue | numeric(10,2) | YES | 0 |
| avg_selling_price | numeric(10,2) | YES | 0 |
| inventory_turnover | numeric(5,2) | YES | 0 |
| conversion_rate | numeric(5,2) | YES | 0 |
| return_rate | numeric(5,2) | YES | 0 |
| profit_margin | numeric(5,2) | YES | 0 |
| trend_direction | character varying(10) | YES | NULL |
| trend_percentage | numeric(5,2) | YES | 0 |
| seasonality_score | numeric(5,2) | YES | 0 |
| period_start | timestamp with time zone | YES | NULL |
| period_end | timestamp with time zone | YES | NULL |
| calculated_at | timestamp with time zone | YES | now() |

### public.product_location_inventory

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| product_id | uuid | NO | NULL |
| location_id | uuid | NO | NULL |
| quantity | integer(32) | NO | 0 |
| reserved_quantity | integer(32) | NO | 0 |
| reorder_point | integer(32) | YES | 10 |
| max_stock | integer(32) | YES | NULL |
| bin_location | character varying(100) | YES | NULL |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.product_suppliers

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| product_id | uuid | NO | NULL |
| supplier_id | uuid | NO | NULL |
| supplier_sku | character varying(255) | YES | NULL |
| lead_time_days | integer(32) | YES | 7 |
| minimum_order_quantity | integer(32) | YES | 1 |
| cost_per_unit | numeric(10,2) | YES | NULL |
| is_preferred | boolean | YES | false |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.product_views

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| store_id | uuid | NO | NULL |
| product_id | uuid | NO | NULL |
| customer_id | uuid | YES | NULL |
| session_id | text | NO | NULL |
| referrer | text | YES | NULL |
| device_type | text | YES | NULL |
| view_duration | integer(32) | YES | NULL |
| created_at | timestamp with time zone | YES | now() |

### public.products

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | uuid_generate_v4() |
| store_id | uuid | NO | NULL |
| category_id | uuid | YES | NULL |
| name | character varying(255) | NO | NULL |
| description | text | YES | NULL |
| price | numeric(10,2) | NO | NULL |
| compare_price | numeric(10,2) | YES | NULL |
| sku | character varying(100) | YES | NULL |
| barcode | character varying(100) | YES | NULL |
| weight | numeric(8,2) | YES | NULL |
| dimensions | jsonb | YES | NULL |
| images | jsonb | YES | NULL |
| is_active | boolean | YES | true |
| is_featured | boolean | YES | false |
| inventory_quantity | integer(32) | YES | 0 |
| low_stock_threshold | integer(32) | YES | 5 |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| cost_price | numeric(10,2) | YES | 0 |
| reorder_point | integer(32) | YES | 10 |
| max_stock | integer(32) | YES | NULL |
| inventory_tracking | boolean | YES | true |
| reserved_quantity | integer(32) | YES | 0 |
| last_restocked_at | timestamp with time zone | YES | NULL |
| average_cost | numeric(10,2) | YES | 0 |
| category | text | YES | NULL |
| image_alt | text | YES | NULL |
| gallery_images | ARRAY | YES | '{}'::text[] |
| image_url | text | YES | NULL |
| compare_at_price | numeric(10,2) | YES | NULL |

### public.reorder_suggestions

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| store_id | uuid | NO | NULL |
| product_id | uuid | NO | NULL |
| current_stock | integer(32) | NO | NULL |
| suggested_quantity | integer(32) | NO | NULL |
| priority_score | integer(32) | NO | 0 |
| reason | text | YES | NULL |
| estimated_stockout_date | date | YES | NULL |
| created_at | timestamp with time zone | YES | now() |
| is_actioned | boolean | YES | false |
| actioned_at | timestamp with time zone | YES | NULL |

### public.segment_memberships

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| segment_id | uuid | NO | NULL |
| lead_id | uuid | YES | NULL |
| customer_email | character varying(255) | NO | NULL |
| added_at | timestamp with time zone | YES | now() |
| removed_at | timestamp with time zone | YES | NULL |
| is_active | boolean | YES | true |

### public.store_customizations

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| store_id | uuid | NO | NULL |
| contact_email | text | YES | NULL |
| social_facebook | text | YES | NULL |
| social_twitter | text | YES | NULL |
| social_instagram | text | YES | NULL |
| social_tiktok | text | YES | NULL |
| seo_title | text | YES | NULL |
| seo_description | text | YES | NULL |
| seo_keywords | ARRAY | YES | NULL |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.store_integrations

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| store_id | uuid | NO | NULL |
| integration_type | character varying(50) | NO | NULL |
| integration_name | character varying(100) | NO | NULL |
| provider | character varying(50) | NO | NULL |
| is_enabled | boolean | YES | false |
| config | jsonb | YES | '{}'::jsonb |
| credentials | jsonb | YES | '{}'::jsonb |
| status | character varying(20) | YES | 'pending'::character varying |
| last_synced | timestamp with time zone | YES | NULL |
| error_message | text | YES | NULL |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.store_owner_subscriptions

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | uuid_generate_v4() |
| store_owner_id | uuid | NO | NULL |
| subscription_tier | USER-DEFINED | NO | NULL |
| status | USER-DEFINED | NO | NULL |
| stripe_subscription_id | character varying(255) | YES | NULL |
| stripe_customer_id | character varying(255) | YES | NULL |
| current_period_start | timestamp with time zone | YES | NULL |
| current_period_end | timestamp with time zone | YES | NULL |
| trial_start | timestamp with time zone | YES | NULL |
| trial_end | timestamp with time zone | YES | NULL |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.store_owners

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | uuid_generate_v4() |
| email | character varying(255) | NO | NULL |
| google_id | character varying(255) | YES | NULL |
| apple_id | character varying(255) | YES | NULL |
| subscription_tier | USER-DEFINED | YES | 'trial'::subscription_tier |
| trial_expires_at | timestamp with time zone | YES | NULL |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.store_page_layouts

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| store_id | uuid | NO | NULL |
| page_type | text | NO | 'storefront'::text |
| page_document_id | uuid | NO | NULL |
| is_active | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.store_policies

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| store_id | uuid | NO | NULL |
| privacy_policy | text | YES | NULL |
| returns_policy | text | YES | NULL |
| about_us | text | YES | NULL |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| terms_of_service | text | YES | NULL |
| contact_us | text | YES | NULL |

### public.store_settings

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | uuid_generate_v4() |
| store_id | uuid | NO | NULL |
| setting_key | character varying(100) | NO | NULL |
| setting_value | jsonb | YES | NULL |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.store_template_assets

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| template_id | uuid | NO | NULL |
| asset_type | character varying(50) | NO | NULL |
| asset_url | text | NO | NULL |
| asset_alt | text | YES | NULL |
| file_size | integer(32) | YES | NULL |
| mime_type | character varying(100) | YES | NULL |
| created_at | timestamp with time zone | YES | now() |

### public.store_template_sections

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| template_id | uuid | NO | NULL |
| section_type | character varying(50) | NO | NULL |
| section_config | jsonb | NO | '{}'::jsonb |
| sort_order | integer(32) | YES | 0 |
| is_enabled | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.store_templates

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| store_id | uuid | NO | NULL |
| layout_id | character varying(100) | NO | NULL |
| color_scheme_id | character varying(100) | NO | NULL |
| customizations | jsonb | YES | '{}'::jsonb |
| is_active | boolean | YES | true |
| preview_mode | boolean | YES | false |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.storefront_navigation_menus

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| store_id | uuid | NO | NULL |
| name | text | NO | NULL |
| location | text | NO | 'header'::text |
| items | jsonb | NO | '[]'::jsonb |
| is_active | boolean | YES | true |
| max_depth | integer(32) | YES | 3 |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.storefront_page_analytics

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| page_id | uuid | NO | NULL |
| date | date | NO | CURRENT_DATE |
| page_views | integer(32) | YES | 0 |
| unique_visitors | integer(32) | YES | 0 |
| bounce_rate | numeric(5,2) | YES | 0 |
| avg_time_on_page | integer(32) | YES | 0 |
| organic_traffic | integer(32) | YES | 0 |
| direct_traffic | integer(32) | YES | 0 |
| referral_traffic | integer(32) | YES | 0 |
| social_traffic | integer(32) | YES | 0 |
| created_at | timestamp with time zone | YES | now() |

### public.storefront_page_templates

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| name | text | NO | NULL |
| description | text | YES | NULL |
| category | text | YES | 'general'::text |
| content | jsonb | NO | '{"sections": []}'::jsonb |
| preview_image | text | YES | NULL |
| is_public | boolean | YES | true |
| is_featured | boolean | YES | false |
| tags | ARRAY | YES | NULL |
| created_by | text | YES | NULL |
| version | text | YES | '1.0.0'::text |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.storefront_page_versions

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| page_id | uuid | NO | NULL |
| version_number | integer(32) | NO | NULL |
| version_note | text | YES | NULL |
| content | jsonb | NO | NULL |
| seo_data | jsonb | YES | NULL |
| created_by | uuid | YES | NULL |
| created_at | timestamp with time zone | YES | now() |

### public.storefront_pages

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| store_id | uuid | NO | NULL |
| title | text | NO | NULL |
| slug | text | NO | NULL |
| page_type | text | NO | 'custom'::text |
| content | jsonb | NO | '{"sections": []}'::jsonb |
| is_published | boolean | YES | false |
| is_home_page | boolean | YES | false |
| show_in_navigation | boolean | YES | true |
| navigation_order | integer(32) | YES | 0 |
| navigation_label | text | YES | NULL |
| meta_title | text | YES | NULL |
| meta_description | text | YES | NULL |
| meta_keywords | text | YES | NULL |
| og_title | text | YES | NULL |
| og_description | text | YES | NULL |
| og_image | text | YES | NULL |
| canonical_url | text | YES | NULL |
| template_id | uuid | YES | NULL |
| version | integer(32) | YES | 1 |
| last_published_at | timestamp with time zone | YES | NULL |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.stores

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | uuid_generate_v4() |
| store_owner_id | uuid | NO | NULL |
| store_name | character varying(255) | NO | NULL |
| store_slug | character varying(100) | NO | NULL |
| store_domain | character varying(255) | YES | NULL |
| description | text | YES | NULL |
| logo_url | character varying(500) | YES | NULL |
| is_active | boolean | YES | true |
| subscription_status | USER-DEFINED | YES | 'trial'::subscription_status |
| trial_expires_at | timestamp with time zone | YES | NULL |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| financial_year_start_month | integer(32) | YES | 1 |
| financial_year_start_day | integer(32) | YES | 1 |
| payment_enabled | boolean | YES | false |
| stripe_publishable_key | text | YES | NULL |
| stripe_webhook_secret | text | YES | NULL |
| store_address_line1 | text | YES | NULL |
| store_address_line2 | text | YES | NULL |
| store_city | text | YES | NULL |
| store_state | text | YES | NULL |
| store_postal_code | text | YES | NULL |
| store_country | text | YES | NULL |
| store_phone | text | YES | NULL |
| store_logo_url | text | YES | NULL |

### public.stripe_configurations

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| store_id | uuid | NO | NULL |
| stripe_publishable_key | text | YES | NULL |
| stripe_secret_key | text | YES | NULL |
| webhook_endpoint_id | text | YES | NULL |
| webhook_endpoint_url | text | YES | NULL |
| webhook_secret | text | YES | NULL |
| is_configured | boolean | YES | false |
| is_live_mode | boolean | YES | false |
| test_mode_configured | boolean | YES | false |
| live_mode_configured | boolean | YES | false |
| last_validated_at | timestamp with time zone | YES | NULL |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.suppliers

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| store_id | uuid | NO | NULL |
| name | character varying(255) | NO | NULL |
| contact_person | character varying(255) | YES | NULL |
| email | character varying(255) | YES | NULL |
| phone | character varying(50) | YES | NULL |
| address | text | YES | NULL |
| website | character varying(255) | YES | NULL |
| notes | text | YES | NULL |
| is_active | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### public.user_subscriptions

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| user_id | uuid | NO | NULL |
| stripe_subscription_id | text | YES | NULL |
| stripe_customer_id | text | YES | NULL |
| status | text | NO | NULL |
| current_period_start | timestamp with time zone | YES | NULL |
| current_period_end | timestamp with time zone | YES | NULL |
| cancel_at_period_end | boolean | YES | false |
| canceled_at | timestamp with time zone | YES | NULL |
| trial_start | timestamp with time zone | YES | NULL |
| trial_end | timestamp with time zone | YES | NULL |
| plan_id | text | YES | NULL |
| plan_name | text | YES | NULL |
| plan_amount | integer(32) | YES | NULL |
| plan_currency | text | YES | 'usd'::text |
| quantity | integer(32) | YES | 1 |
| metadata | jsonb | YES | '{}'::jsonb |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

