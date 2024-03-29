import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import InputFile from "src/components/InputFile";
import * as utils from "src/utils/imageResize";

const testFileResized = new File(["A resized image"], "resized.png", {
  type: "image/png",
});

const mockedCreateObjectURL = jest.fn();
const mockedRevokeObjectURL = jest.fn();
global.URL.createObjectURL = mockedCreateObjectURL;
global.URL.revokeObjectURL = mockedRevokeObjectURL;
const imageResizeSpy = jest.spyOn(utils, "resizeImage");

describe("InputFile", () => {
  const testFile = new File(["An original test image"], "original.png", {
    type: "image/png",
  });

  it("renders an input file", () => {
    render(<InputFile name="test input" label="test label" />);
    const inputElement = screen.getByLabelText(/test label/i);
    expect(inputElement).toBeInTheDocument();
  });

  it("inputs an image file", async () => {
    // cspell:disable-next-line
    render(<InputFile data-testid="test input" name="test input" />);
    const inputElement = screen.getByTestId<HTMLInputElement>(/test input/i);
    await userEvent.upload(inputElement, testFile);

    expect(inputElement.files?.[0]).toStrictEqual(testFile);
    expect(inputElement.files?.item(0)).toStrictEqual(testFile);
    expect(inputElement.files).toHaveLength(1);
  });

  it("renders an image file", async () => {
    mockedCreateObjectURL.mockReturnValue("https://via.placeholder.com/150");
    mockedRevokeObjectURL.mockReturnValue(null);
    imageResizeSpy.mockResolvedValue(testFileResized);

    // cspell:disable-next-line
    render(<InputFile data-testid="test input" name="test input" />);
    const inputElement: HTMLInputElement = screen.getByTestId(/test input/i);
    await userEvent.upload(inputElement, testFile);

    expect(await screen.findByAltText(/resized.png/i)).toBeInTheDocument();
  });

  it("removes an image file using each of the remove buttons", async () => {
    mockedCreateObjectURL.mockReturnValue("https://via.placeholder.com/150");
    mockedRevokeObjectURL.mockReturnValue(null);
    imageResizeSpy.mockResolvedValue(testFileResized);

    // cspell:disable-next-line
    render(<InputFile data-testid="test input" name="test input" />);
    const inputElement: HTMLInputElement = screen.getByTestId(/test input/i);
    await userEvent.upload(inputElement, testFile);

    let removeButtons = await screen.findAllByRole("button", {
      name: /eliminar/i,
    });

    expect(removeButtons).toHaveLength(2);

    await userEvent.click(removeButtons[0]);

    expect(inputElement.files).toHaveLength(0);

    await userEvent.upload(inputElement, testFile);

    expect(inputElement.files).toHaveLength(1);

    removeButtons = await screen.findAllByRole("button", {
      name: /eliminar/i,
    });
    await userEvent.click(removeButtons[1]);

    expect(inputElement.files).toHaveLength(0);
  });
});
