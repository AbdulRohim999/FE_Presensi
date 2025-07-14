// Interface untuk response profile
export interface ProfileResponse {
  idUser: number;
  firstname: string;
  lastname: string;
  tempatTanggalLahir: string;
  email: string;
  role: string;
  nip: string;
  tipeUser: string;
  status: string;
  bidangKerja: string | null;
  alamat: string;
  phoneNumber: string;
  fotoProfile: string;
  fotoProfileUrl: string;
  createdAt: string;
  updatedAt: string;
}

// Interface untuk response foto profil
export interface ProfilePhotoResponse {
  idUser: number;
  fotoProfile: string;
  fotoProfileUrl: string;
}
