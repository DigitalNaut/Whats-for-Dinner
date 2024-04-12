import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Kilobytes from "src/components/common/Kilobytes";

test("renders a custom element with formatted value in bytes as kilobytes", async () => {
  const { rerender } = render(<Kilobytes value={1024} />);

  expect(await screen.findByText("1 KB"));

  rerender(<Kilobytes value={1024 * 1024} />);

  expect(await screen.findByText("1 MB"));

  rerender(<Kilobytes value={1024 ** 2} />);

  expect(await screen.findByText("1 MB"));

  rerender(<Kilobytes value={1024 ** 3} />);

  expect(await screen.findByText("1 GB"));

  rerender(<Kilobytes value={1024 ** 4} />);

  expect(await screen.findByText("1 TB"));

  rerender(<Kilobytes value={0} />);

  expect(await screen.findByText("0 Bytes"));

  rerender(<Kilobytes value={undefined} />);

  expect(await screen.findByText("0 Bytes"));
});
