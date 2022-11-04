import { expect } from "@storybook/jest";
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta, Story } from "@storybook/react/types-6-0";
import React from "react";
import { ButtonBase } from "../ButtonBase";
import { MdSync } from "react-icons/md";
import { screen, userEvent } from "@storybook/testing-library";

export default {
  title: "UI/Button",
} as Meta;

export const Buttons: Story = (args) => (
  <div>
    <ButtonBase
      colorClasses={["bg-green-800", "border-blue-800"]}
      hoverColorClasses={["hover:border-white", "hover:text-amber-800"]}
      marginClasses={["m-4"]}
      onClick={() => {
        // eslint-disable-next-line no-console
        console.log("hello");
      }}
    >
      Default Button
    </ButtonBase>

    <ButtonBase
      colorClasses={["bg-green-800", "border-blue-800"]}
      hoverColorClasses={["hover:border-cyan-800", "hover:text-amber-800"]}
      marginClasses={["m-4"]}
      size={"S"}
    >
      Small
    </ButtonBase>
    <ButtonBase
      colorClasses={["bg-green-800", "border-blue-800"]}
      hoverColorClasses={["hover:border-cyan-800", "hover:text-amber-800"]}
      marginClasses={["m-4"]}
      Icon={<MdSync />}
    >
      With Icon
    </ButtonBase>
    <ButtonBase
      marginClasses={["m-4"]}
      isRounded={false}
      colorClasses={["bg-black", "border-black"]}
      hoverColorClasses={[
        "hover:bg-white",
        "hover:text-black",
        "hover:border-black",
      ]}
    >
      Square
    </ButtonBase>
  </div>
);

Buttons.play = async () => {
  const button = screen.getByText("Default Button");
  await userEvent.click(button);
};
