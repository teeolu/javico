interface IUserPayload {
  data?: {
    displayName: string;
    username: string;
    email: string;
    photoURL: string;
    uid: string;
    githubRepoURL: string;
    location: string;
    bio: string;
  };
  params?: {
    ID: string;
  };
}

export interface IUser {
  displayName: string;
  username: string;
  email: string;
  photoURL: string;
  uid: string;
  githubRepoURL: string;
  location: string;
  bio: string;
}

interface Configuration {
  app: any;
}

export class UsersServiceApi {
  private app: any;
  private firestore: any;
  private auth: any;
  private provider: any;

  constructor(configuration: Configuration) {
    this.app = configuration.app;
    this.auth = configuration.app.auth();
    this.firestore = configuration.app.firestore();
    this.provider = new configuration.app.auth.GithubAuthProvider();
  }

  private updateUserInBackground = (response: any, ID: string) => {
    let user = {
      displayName:
        response.user.displayName || response.additionalUserInfo.profile.name,
      username: response.additionalUserInfo.username,
      email: response.user.email,
      photoURL: response.user.photoURL,
      uid: response.user.uid,
      githubRepoURL: response.additionalUserInfo.profile.url,
      location: response.additionalUserInfo.profile.location,
      bio: response.additionalUserInfo.profile.bio
    };
    this.saveUser({ data: user, params: { ID } });
  };

  public signInWithGithub = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      this.auth
        .signInWithPopup(this.provider)
        .then((response: any) => {
          this.firestore
            .collection("users")
            .where("uid", "==", response.user.uid)
            .get()
            .then((userSnapshot: any) => {
              if (userSnapshot.size === 0) {
                let user: IUser = {
                  displayName:
                    response.user.displayName ||
                    response.additionalUserInfo.profile.name,
                  username: response.additionalUserInfo.username,
                  email: response.user.email,
                  photoURL: response.user.photoURL,
                  uid: response.user.uid,
                  githubRepoURL: response.additionalUserInfo.profile.url,
                  location: response.additionalUserInfo.profile.location,
                  bio: response.additionalUserInfo.profile.bio
                };
                this.saveUser({ data: user })
                  .then(() => {
                    resolve(user);
                  })
                  .catch((error: Error) => reject(error));
              } else {
                /**
                 * Perform a background update of the data
                 * using the online data store
                 */
                userSnapshot.forEach((resp: any) => {
                  this.updateUserInBackground(response, resp.id);
                  let user = resp.data();
                  resolve(user);
                });
              }
            })
            .catch((error: Error) => reject(error));
        })
        .catch((error: Error) => reject(error));
    });
  };

  public onAuthStateChanged = (handleUserChanged: Function): any => {
    return this.auth.onAuthStateChanged(handleUserChanged);
  };

  public getCurrentUser = () => {
    return this.auth.currentUser;
  };

  public saveUser = (payload: IUserPayload) => {
    const { data, params } = payload;
    if (params && params.ID) {
      return this.firestore
        .collection("users")
        .doc(params.ID)
        .set(
          {
            ...data,
            updatedAt: this.app.firestore.FieldValue.serverTimestamp()
          },
          { merge: true }
        );
    }
    return this.firestore.collection("users").add({
      ...data,
      createdAt: this.app.firestore.FieldValue.serverTimestamp()
    });
  };

  public fetchUserFromDB = (payload: IUserPayload): Promise<any> => {
    const { params } = payload;
    const _params = params || ({} as any);
    return new Promise((resolve, reject) => {
      this.firestore
        .collection("users")
        .where("uid", "==", _params.ID)
        .get()
        .then((userSnapShot: any) => {
          userSnapShot.forEach((resp: any) => {
            let user = resp.data();
            resolve(user);
          });
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
  };

  logout = (): Promise<any> => {
    return this.auth.signOut();
  };
}
