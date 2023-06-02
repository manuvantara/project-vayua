export function getShortName(name: string): string {
  const names: string[] = name.split(" ");

  if (names.length === 1) {
    return name;
  }

  const firstName: string = names[0];
  const lastName: string = names[names.length - 1];
  const lastInitial: string = lastName.substring(0, 1) + ".";
  return firstName + " " + lastInitial;
}

export const getInitials = (fullName: string) => {
  const allNames = fullName.trim().split(" ");
  const initials = allNames.reduce((acc, curr, index) => {
    if (index === 0 || index === allNames.length - 1) {
      acc = `${acc}${curr.charAt(0).toUpperCase()}`;
    }
    return acc;
  }, "");
  return initials;
};
