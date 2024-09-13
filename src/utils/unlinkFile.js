import fs from "fs";

const unlinkFile = (localFilePath) => {
  fs.unlinkSync(localFilePath);
};

export default unlinkFile;
