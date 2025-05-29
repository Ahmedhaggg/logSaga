export type GoogleSuccessUserAuthResponse = {
  name: { givenName: string; familyName: string };
  emails: { value: string }[];
  photos: { value: string }[];
};

export type GoogleUserInfo = {
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
};
