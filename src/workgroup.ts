type WorkGroup = {
    name: string,
    id: string,
    type?: string,
    configuration: string,
    subgroups: Set<string>,
    members: Set<string>,
    team_projects: Set<string>
}

const SourceTypeMap: Map<string, string> = new Map(Object.entries({
    'mock.json' : 'mock-data'
}))

//todo types
export const fromDataSource = (sourcename: string, groupname: string, data: any): WorkGroup =>{
    const subgroups: string[] = []
    const members: string[] = []

    for (const subgroup in data.members) {
        subgroups.push(subgroup)
        members.push(...data.members[subgroup])
    }

    return {
        name: groupname,
        id: `workgroup:${groupname}`,
        type: SourceTypeMap.get(sourcename),
        configuration: `implement me`,
        subgroups: new Set(subgroups),
        members: new Set(members),
        team_projects: new Set(data.team_projects)
    }
}