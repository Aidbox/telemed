import { AppointmentData } from '../modules/common'

export function transformRoleDataWithMerge (params: any, resource: any) {
  const address = mergeAddress(params, resource)
  const telecom = mergeTelecom(params, resource)
  const name = mergeName(params, resource)
  const root = mergeRoot(params, resource)

  return {
    ...(address ? { address } : {}),
    ...(telecom ? { telecom } : {}),
    ...(name ? { name } : {}),
    ...root
  }
}

export function transformUserData (params: any, resource: any) {
  const password = params.password || resource.password
  const email = params.email || resource.email
  const given = params.given || resource.name?.givenName
  const family = params.family || resource.name?.familyName
  const name = {
    ...(given ? { givenName: given } : {}),
    ...(family ? { familyName: family } : {})
  }

  return {
    name,
    ...(email ? { email } : {}),
    ...(password ? { password } : {}),
    firstEntry: false
  }
}

function mergeRoot (data: any, user: any) {
  const { birthDate, gender } = data
  const { birthDate: exBirthDate, gender: exGender } = user

  return {
    ...(birthDate
      ? { birthDate }
      : exBirthDate
      ? { birthDate: exBirthDate }
      : {}),
    ...(gender ? { gender } : exGender ? { gender: exGender } : {})
  }
}

export function mergeAddress (data: any, user: any) {
  const { country, city, line, postalCode } = data
  const { address } = user

  return [
    {
      ...(address?.[0] || {}),
      use: 'home',
      type: 'physical',
      ...(postalCode ? { postalCode } : {}),
      ...(country ? { country } : {}),
      ...(city ? { city } : {}),
      ...(line ? { line: [line] } : {})
    }
  ]
}

export function mergeTelecom (data: any, user: any) {
  const { phone, email } = data
  const { telecom } = user

  const exPhone = (telecom || []).find((item: any) => item.system === 'phone')
  const exEmail = (telecom || []).find((item: any) => item.system === 'email')

  return [
    ...(phone ? [{ system: 'phone', value: phone }] : exPhone ? [exPhone] : []),
    ...(email ? [{ system: 'email', value: email }] : exEmail ? [exEmail] : [])
  ]
}

export function mergeName (data: any, user: any) {
  const { family, given } = data
  const { name } = user

  return [
    {
      ...(name?.[0] || {}),
      use: 'usual',
      ...(given ? { given: [given] } : {}),
      ...(family ? { family } : {})
    }
  ]
}

export function transformUpdateUserData (data: any) {
  const userParams: Record<string, any> = {}
    const ptParams: Record<string, any> = {}
    const practParams: Record<string, any> = {}

  if (data.city && data.country && data.line && data.postalCode) {
    ptParams.address = [{}]
    practParams.address = [{}]
  }

  Object.keys(data).forEach((key) => {
    switch (key) {
      case 'email': {
        userParams.email = data[key]
        break
      }
      case 'displayName': {
        if (!Object.hasOwnProperty.call(userParams, 'name')) {
          userParams.name = {}
        }
        userParams.name.formatted = data[key]
        break
      }
      case 'firstName': {
        if (!Object.hasOwnProperty.call(userParams, 'name')) {
          userParams.name = {}
        }
        if (!Object.hasOwnProperty.call(ptParams, 'name')) {
          ptParams.name = [{}]
        }
        if (!Object.hasOwnProperty.call(practParams, 'name')) {
          practParams.name = [{}]
        }
        userParams.name.givenName = data[key]
        ptParams.name[0].given = [data[key]]
        practParams.name[0].given = [data[key]]
        break
      }

      case 'lastName': {
        if (!Object.hasOwnProperty.call(userParams, 'name')) {
          userParams.name = {}
        }
        if (!Object.hasOwnProperty.call(ptParams, 'name')) {
          ptParams.name = [{}]
        }
        if (!Object.hasOwnProperty.call(practParams, 'name')) {
          practParams.name = [{}]
        }
        userParams.name.familyName = data[key]
        ptParams.name[0].family = data[key]
        practParams.name[0].family = data[key]
        break
      }
      case 'password': {
        userParams.password = data[key]
        break
      }
      case 'gender': {
        userParams.gender = data[key]
        ptParams.gender = data[key]
        practParams.gender = data[key]
        break
      }
      case 'phone': {
        ptParams.telecom = [
          { use: 'mobile', value: data[key], system: 'phone' }
        ]
        practParams.telecom = [
          { use: 'mobile', value: data[key], system: 'phone' }
        ]
        break
      }
      case 'country': {
        ptParams.address[0].country = data[key]
        practParams.address[0].country = data[key]
        break
      }
      case 'city': {
        ptParams.address[0].city = data[key]
        practParams.address[0].city = data[key]
        break
      }
      case 'line': {
        if (Array.isArray(data[key])) data[key] = data[key][0]
        ptParams.address[0].line = [data[key]]
        practParams.address[0].line = [data[key]]
        break
      }
      case 'postalCode': {
        ptParams.address[0].postalCode = data[key]
        practParams.address[0].postalCode = data[key]
        break
      }
      case 'birthDate': {
        ptParams.birthDate = data[key]
        practParams.birthDate = data[key]
        break
      }
    }
  })
  userParams.firstEntry = false
  return { userParams, ptParams, practParams }
}

export function transformAppointmentCreateDataToEncounter (data: AppointmentData) {
  const result: Record<string, any> = {
    status: 'planned',
    class: {
      code: 'VR',
      system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
      display: 'virtual'
    },
    serviceType: {
      coding: [
        {
          code: '124',
          system: 'http://terminology.hl7.org/CodeSystem/service-type',
          display: 'General Practice'
        }
      ]
    },
    reasonCode: [{ text: data.chief }],
    subject: { resourceType: 'Patient', id: data.patient },
    participant: [{ individual: { id: data.practitioner, resourceType: 'Practitioner' } }],
    period: {
      start: new Date()
    }
  }

  return result
}

export function transformAppointmentData (data: AppointmentData) {
  return {
    status: 'booked',
    start: data.start,
    end: data.end,
    participant: [
      { actor: { resourceType: 'Patient', id: data.patient }, status: 'accepted' },
      { actor: { resourceType: 'Practitioner', id: data.practitioner }, status: 'accepted' }
    ]
  }
}
