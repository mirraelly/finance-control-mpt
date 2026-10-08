function getFieldLabel(element) {
  const wrapper = element.closest(".date-picker, .select-field");
  const fieldLabel =
    wrapper?.querySelector(".date-picker__label, .select-field__label") ||
    element.labels?.[0];

  if (fieldLabel) {
    const labelText = Array.from(fieldLabel.childNodes)
      .filter((node) => node.nodeType === 3)
      .map((node) => node.textContent.trim())
      .filter(Boolean)
      .join(" ");
    const text =
      labelText ||
      fieldLabel.querySelector(".input-field__label-text")?.textContent ||
      fieldLabel.textContent;
    if (text.trim()) return text.trim();
  }

  const externalLabel = element
    .closest(".form-field")
    ?.querySelector("label");
  return (
    externalLabel?.textContent.trim() ||
    element.name ||
    element.id ||
    "Campo obrigatório"
  );
}

function validateRequiredFields(event, showToast) {
  const form = event.currentTarget;
  const requiredElements = form.querySelectorAll(
    "[required], [aria-required='true']",
  );
  const missingFields = new Map();

  requiredElements.forEach((element) => {
    const wrapper = element.closest(".date-picker, .select-field");
    const valueElement =
      element.getAttribute("aria-required") === "true"
        ? wrapper?.querySelector('input[type="hidden"]')
        : element;
    const value = valueElement?.value ?? element.value;

    if (String(value ?? "").trim()) return;

    const label = getFieldLabel(element)
      .toLocaleLowerCase("pt-BR")
      .replace(/^./u, (character) => character.toLocaleUpperCase("pt-BR"));
    missingFields.set(label, label);
  });

  if (missingFields.size === 0) return true;

  showToast({
    type: "error",
    title: "Dados inválidos",
    message: `Preencha os campos obrigatórios: ${Array.from(missingFields.values()).join(", ")}.`,
  });
  return false;
}

export default validateRequiredFields;
