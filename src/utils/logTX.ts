import figlet from "figlet";
import gradient from "gradient-string";

export const logTX = (): void => {
  const text = figlet.textSync("TheophilusX", {
    font: "Rectangles",
    horizontalLayout: "default",
    verticalLayout: "default",
  });

  const gradientText = gradient(["cyan", "magenta"])(text);

  console.log("\n" + gradientText + "\n");
};

if (require.main === module) {
  logTX();
}

export default logTX;
