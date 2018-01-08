import exampleDoc from "../example-doc";

test('example document conforms to schema', () => {
  exampleDoc.check();
});
