variable "org_name" {}
variable "api_token" {}
variable "base_url" {}
variable "client_base_uri" {}


provider "okta" { 
    org_name = "${var.org_name}"
    base_url = "${var.base_url}"
    api_token = "${var.api_token}"
}

data "okta_group" "all" {
  name = "Everyone"
}

resource "okta_app_oauth" "persona_management_client" {
    label = "Developer Management Application"
    status = "ACTIVE"
    type = "web"
    grant_types = ["authorization_code"]
    response_types = ["code"]
    redirect_uris = ["${var.client_base_uri}/authorization-code/callback"]
    post_logout_redirect_uris = ["${var.client_base_uri}"]
    groups = ["${data.okta_group.all.id}"]
} 

resource "okta_group" "team" {
  name = "Spider Monkeys"
  description = "A small nimble development team."
}

resource "okta_user" "Ada" {
    login = "ada@lovelace.local"
    email = "ada@lovelace.local"
    first_name = "Ada"
    last_name = "Lovelace"
    group_memberships = ["${okta_group.team.id}"]
    //Can't find a way to restrict this to the above group in the provider
    //default is to all groups which shows a bit too much data in the demo
    admin_roles = ["USER_ADMIN"]
}

resource "okta_user" "Babbage" {
    login = "charles@babbage.local"
    email = "charles@babbage.local"
    first_name = "Charles"
    last_name = "Babbage"
    group_memberships = ["${okta_group.team.id}"]
}
