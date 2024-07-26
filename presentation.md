For our hackweek project we worked on a web interface to Data Access Workgroups and GCPv2 workgroups.

For those of you who don't know what Data Access Workgroups are: consider yourself lucky. Workgroups are the abstraction SRE uses on top of GCP IAM to reason about and grant access to resources in GCP.

For the folks here that's usually related to accessing workgroup-confidential data, like needing to be a member of a `revenue` workgroup to have access to revenue data, but workgroups are used for managing service permissions across all kinds of applications and permissions boundaries.

None of this information is particularly secret, in fact it's explicitly classified as `workgroup:mozilla-confidential`, but it's not very accessible currently. It's easy for an SRE to say "all of this codified in terraform or bqetl metadata, just go read the code" but that's not realistic for a lot of folks, particularly management, and dealing with workgroups typically skews towards management.

So we built a web frontend for the terraform configuration we use to manage workgroups, and put it behind SSO via protosaur.

It's a simple static site and you can check it out at https://protosaur.dev/dawg. Probably worth talking about the tech stack here but I don't actually know anything about it.

At the top we have some background information about how to use the site, workgroups generally, and how we classify data at Mozilla.

Then we've got a list of workgroups in a nice UI that :whd had absolutely no involvement in making. There are currently 138 workgroups (there were 155 at the beginning of the week), so there's potentially a lot of information to go through.

We've got search functionality to let you look for specific pieces of information, as well as hopefully enough metadata about any particular workgroup to answer any questions you might have about it.

For a demo we can try to answer some of the questions from the [FAQ](./FAQ.md) using DAWG.

Future improvements:

* Fix showing individual members of subgroups / better subgroup search
* More linkability
* STMO/Notebooks config
* Use DAWG to deprecate/clean up more groups
* Automate site builds and terraform state updates
