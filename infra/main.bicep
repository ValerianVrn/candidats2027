// Candidats 2027: hosting. Deploy at resource-group scope:
//   az deployment group create -g rg-candidats2027 -f infra/main.bicep
targetScope = 'resourceGroup'

@description('Azure region for the Static Web Apps.')
param location string = 'westeurope'

@description('Hosting plan per environment. Free: 100 GB/month hard cap, no SLA. Standard: SLA, paid overage.')
@allowed(['Free', 'Standard'])
param devSku string = 'Free'

@allowed(['Free', 'Standard'])
param prodSku string = 'Free'

var tags = { project: 'candidats2027' }

resource dev 'Microsoft.Web/staticSites@2024-04-01' = {
  name: 'swa-candidats2027-dev'
  location: location
  tags: union(tags, { environment: 'dev' })
  sku: { name: devSku, tier: devSku }
  properties: {
    // Deployed from GitHub Actions with a deployment token; no repository link, no PR previews.
    stagingEnvironmentPolicy: 'Disabled'
    allowConfigFileUpdates: true
  }
}

resource prod 'Microsoft.Web/staticSites@2024-04-01' = {
  name: 'swa-candidats2027-prod'
  location: location
  tags: union(tags, { environment: 'prod' })
  sku: { name: prodSku, tier: prodSku }
  properties: {
    stagingEnvironmentPolicy: 'Disabled'
    allowConfigFileUpdates: true
  }
}

output devHostname string = dev.properties.defaultHostname
output prodHostname string = prod.properties.defaultHostname
output devId string = dev.id
output prodId string = prod.id
