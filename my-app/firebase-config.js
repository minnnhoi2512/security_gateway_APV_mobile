import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

const FIREBASE_API_KEY = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
const FIREBASE_STORAGE_BUCKET = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET;
const FIREBASE_APP_ID = process.env.EXPO_PUBLIC_FIREBASE_APP_ID;
const FIREBASE_PROJECTID = process.env.EXPO_PUBLIC_FIREBASE_PROJECTID;

// console.log(FIREBASE_API_KEY);

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  appId: FIREBASE_APP_ID,
  projectId: FIREBASE_PROJECTID,
};

if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}

const fbApp = getApp();
const fbStorage = getStorage();
const chatDB = getFirestore();

const uploadToFirebase = async (uri, name, onProgess) => {
  const fetchRespone = await fetch(uri);
  const theBlob = await fetchRespone.blob();
  console.log(theBlob);
  const imageRef = ref(getStorage(), `images/${name}"`);

  const uploadTask = uploadBytesResumable(imageRef, theBlob);
  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgess && onProgess(progress);
      },
      (error) => {
        reject(error);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({
          downloadUrl,
          metadata: uploadTask.snapshot.metadata,
        });
      }
    );
  });
};

const uploadImageChat = async (file) => {
  try {
    const response = await fetch(file.uri);
    const blob = await response.blob();
    const date = new Date();
    const storageRef = ref(getStorage(), `images/${date.getTime()}-${file.uri.split('/').pop()}`);

    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          reject("Something went wrong! " + error.code);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  } catch (error) {
    console.error("Error uploading image: ", error);
    throw error;
  }
};
export { chatDB, fbApp, fbStorage, uploadToFirebase, uploadImageChat };
