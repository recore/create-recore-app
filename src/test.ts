import { join } from "path";
import Template from "./template/recore";

const t = new Template({
  autoInstall: false,
  ctxPath: join(process.cwd(), "data/test"),
  name: "@ali/recore-template",
});
t.create();
