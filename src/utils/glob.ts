import * as glob from "glob";
import { promisify } from "util";

export default promisify(glob);
