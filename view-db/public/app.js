const state = {
  dbKey: null,
  dbLabel: "",
  table: null,
  page: 1,
  pageSize: 20,
  meta: null,
  rows: [],
  total: 0,
  pageCount: 1,
  editKeys: null,
};

const screens = {
  db: document.getElementById("screen-db"),
  tables: document.getElementById("screen-tables"),
  rows: document.getElementById("screen-rows"),
};

const dbButtons = document.getElementById("db-buttons");
const tableList = document.getElementById("table-list");
const dataTable = document.getElementById("data-table");
const errorBox = document.getElementById("error");
const dialog = document.getElementById("row-dialog");
const rowForm = document.getElementById("row-form");
const formFields = document.getElementById("form-fields");
const dialogTitle = document.getElementById("dialog-title");

function showScreen(name) {
  Object.entries(screens).forEach(([key, el]) => {
    el.classList.toggle("hidden", key !== name);
  });
}

function showError(message) {
  if (!message) {
    errorBox.classList.add("hidden");
    errorBox.textContent = "";
    return;
  }
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? `HTTP ${response.status}`);
  }
  return data;
}

function formatCell(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function rowKeys(row) {
  const pk = state.meta?.primaryKey ?? [];
  const keys = {};
  for (const col of pk) {
    keys[col] = row[col];
  }
  return keys;
}

async function loadConfig() {
  const config = await api("/api/config");
  dbButtons.innerHTML = "";

  for (const key of ["local", "work"]) {
    const item = config[key];
    const card = document.createElement("div");
    card.className = "db-card";

    const title = document.createElement("h3");
    title.textContent = item.label;

    const desc = document.createElement("p");
    desc.textContent = item.configured
      ? `Хост: ${item.host ?? "—"}`
      : "Не настроено в .env";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "primary";
    btn.textContent = "Выбрать";
    btn.disabled = !item.configured;
    btn.addEventListener("click", () => selectDb(key, item.label));

    card.append(title, desc, btn);
    dbButtons.appendChild(card);
  }
}

async function selectDb(dbKey, label) {
  state.dbKey = dbKey;
  state.dbLabel = label;
  document.getElementById("db-label").textContent = label;
  showError("");
  showScreen("tables");
  await loadTables();
}

async function loadTables() {
  tableList.innerHTML = "";
  const { tables } = await api(`/api/${state.dbKey}/tables`);

  for (const name of tables) {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = name;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "primary";
    btn.textContent = "Открыть";
    btn.addEventListener("click", () => openTable(name));

    li.append(span, btn);
    tableList.appendChild(li);
  }
}

async function openTable(name) {
  state.table = name;
  state.page = 1;
  document.getElementById("table-label").textContent = `${state.dbLabel} · ${name}`;
  showError("");
  showScreen("rows");
  await loadTableData();
}

async function loadTableData() {
  const meta = await api(`/api/${state.dbKey}/tables/${state.table}/meta`);
  const data = await api(
    `/api/${state.dbKey}/tables/${state.table}/rows?page=${state.page}&pageSize=${state.pageSize}`,
  );

  state.meta = meta;
  state.rows = data.rows;
  state.total = data.total;
  state.pageCount = data.pageCount;

  renderTable();
  updatePagination();
}

function renderTable() {
  const thead = dataTable.querySelector("thead");
  const tbody = dataTable.querySelector("tbody");
  thead.innerHTML = "";
  tbody.innerHTML = "";

  const columns = state.meta.columns.map((col) => col.name);
  const headRow = document.createElement("tr");
  for (const col of columns) {
    const th = document.createElement("th");
    th.textContent = col;
    headRow.appendChild(th);
  }
  const actionsTh = document.createElement("th");
  actionsTh.textContent = "Действия";
  headRow.appendChild(actionsTh);
  thead.appendChild(headRow);

  for (const row of state.rows) {
    const tr = document.createElement("tr");
    for (const col of columns) {
      const td = document.createElement("td");
      td.textContent = formatCell(row[col]);
      tr.appendChild(td);
    }

    const actionsTd = document.createElement("td");
    const actions = document.createElement("div");
    actions.className = "row-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.textContent = "Изменить";
    editBtn.addEventListener("click", () => openEditDialog(row));

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "danger";
    deleteBtn.textContent = "Удалить";
    deleteBtn.addEventListener("click", () => deleteRow(row));

    actions.append(editBtn, deleteBtn);
    actionsTd.appendChild(actions);
    tr.appendChild(actionsTd);
    tbody.appendChild(tr);
  }
}

function updatePagination() {
  document.getElementById("page-info").textContent =
    `Стр. ${state.page} из ${state.pageCount} (всего ${state.total})`;
  document.getElementById("prev-page").disabled = state.page <= 1;
  document.getElementById("next-page").disabled = state.page >= state.pageCount;
}

function openCreateDialog() {
  state.editKeys = null;
  dialogTitle.textContent = "Создать запись";
  buildForm({});
  dialog.showModal();
}

function openEditDialog(row) {
  state.editKeys = rowKeys(row);
  dialogTitle.textContent = "Изменить запись";
  buildForm(row, true);
  dialog.showModal();
}

function buildForm(row, isEdit = false) {
  formFields.innerHTML = "";
  const pk = new Set(state.meta.primaryKey);

  for (const col of state.meta.columns) {
    if (isEdit && pk.has(col.name)) continue;

    const field = document.createElement("div");
    field.className = "field";

    const label = document.createElement("label");
    label.textContent = col.name;
    label.htmlFor = `field-${col.name}`;

    const input = document.createElement("input");
    input.id = `field-${col.name}`;
    input.name = col.name;
    input.value = row[col.name] ?? "";

    const hint = document.createElement("small");
    hint.textContent = `${col.dataType}${col.isNullable ? "" : ", NOT NULL"}`;

    field.append(label, input, hint);
    formFields.appendChild(field);
  }
}

async function deleteRow(row) {
  if (!confirm("Удалить эту запись?")) return;
  try {
    showError("");
    await api(`/api/${state.dbKey}/tables/${state.table}/rows`, {
      method: "DELETE",
      body: JSON.stringify({ keys: rowKeys(row) }),
    });
    await loadTableData();
  } catch (error) {
    showError(error.message);
  }
}

rowForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(rowForm);
  const values = {};
  for (const [key, value] of formData.entries()) {
    if (key === "submit") continue;
    values[key] = value === "" ? null : value;
  }

  try {
    showError("");
    if (state.editKeys) {
      await api(`/api/${state.dbKey}/tables/${state.table}/rows`, {
        method: "PUT",
        body: JSON.stringify({ keys: state.editKeys, values }),
      });
    } else {
      await api(`/api/${state.dbKey}/tables/${state.table}/rows`, {
        method: "POST",
        body: JSON.stringify(values),
      });
    }
    dialog.close();
    await loadTableData();
  } catch (error) {
    showError(error.message);
  }
});

document.getElementById("cancel-dialog").addEventListener("click", () => dialog.close());
document.getElementById("back-to-db").addEventListener("click", () => showScreen("db"));
document.getElementById("back-to-tables").addEventListener("click", () => showScreen("tables"));
document.getElementById("create-row").addEventListener("click", openCreateDialog);
document.getElementById("prev-page").addEventListener("click", async () => {
  if (state.page <= 1) return;
  state.page -= 1;
  await loadTableData();
});
document.getElementById("next-page").addEventListener("click", async () => {
  if (state.page >= state.pageCount) return;
  state.page += 1;
  await loadTableData();
});

loadConfig().catch((error) => {
  showError(error.message);
});
