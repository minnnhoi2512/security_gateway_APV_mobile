import { initializeApp, getApp, getApps } from "firebase/app";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
const FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET;
const FIREBASE_APP_ID = process.env.FIREBASE_APP_ID;

// console.log(FIREBASE_API_KEY);

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  appId: FIREBASE_APP_ID,
};

if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}

const fbApp = getApp();
const fbStorage = getStorage();

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
        reject(error)
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({
          downloadUrl,
          metadata : uploadTask.snapshot.metadata
        })
      }
    );
  });
};

export { fbApp, fbStorage, uploadToFirebase };
