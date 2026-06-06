import { addLocalPatient } from "../../../crm/patientArchiveStore";
import type { Patient } from "../../../crm/mockData";

export type CreatePatientArchiveInput = {
  storeId: string;
  name: string;
  age: number;
  gender: Patient["gender"];
  mobile: string;
  idCard?: string;
  medicalHistory?: Patient["medicalHistory"];
};

export function createPatientArchive(input: CreatePatientArchiveInput) {
  const { storeId, ...rest } = input;
  return addLocalPatient({
    ...rest,
    store: storeId,
    profile: {
      source: "小程序扫码注册",
    },
  });
}
