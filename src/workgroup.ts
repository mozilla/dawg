export type WorkGroup = {
    name: string,
    id: string,
    type?: string,
    links: string[],
    sponsor: string,
    managers: string[],
    subgroups: Set<string>,
    members: Set<string>,
    team_projects: Set<string>
}

const SourceTypeMap: Map<string, string> = new Map(Object.entries({
    'gcpv1_enriched.json' : 'Data Access Workgroup',
    'gcpv2_merged.json' : 'GCPv2 Workgroup'
}))

//todo types
export const fromDataSource = (sourcename: string, groupname: string, data: any): WorkGroup =>{
    const subgroups: string[] = []
    const members: string[] = []

    for (const subgroup in data.members) {
    // skip a couple of internal groups
    if (!["_default", "analysis-writer", "udf", "udf-writer", "team", "default-compute", "syndicate", "syndicated", "unmanaged", "client-managed", "application", "application-noanalysis"].includes(subgroup)) {
        subgroups.push(subgroup)
        members.push(...data.members[subgroup])
       }
    }

    return {
        name: groupname,
        id: `workgroup:${groupname}`,
        // fixme: link to github code search e.g. https://github.com/search?q=%28org%3Amozilla+OR+org%3Amozilla-services+OR+org%3Amozilla-it%29+%22workgroup%3Acontextual-services%22&type=code
        type: SourceTypeMap.get(sourcename),
        links: data?.metadata?.links || [],
        sponsor: data?.metadata?.sponsor || "not listed",
        managers: data?.metadata?.managers || [],
        subgroups: new Set(subgroups),
        members: new Set(members),
        // fixme linkify e.g. https://console.cloud.google.com/home/dashboard?project=moz-fx-data-dataops
        team_projects: new Set(data.team_projects)
    }
}
