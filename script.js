(function () {
  const KEY = 'todo-tasks-v1';
  const form = document.getElementById('add-form');
  const input = document.getElementById('new-task');
  const list = document.getElementById('list');
  const empty = document.getElementById('empty');
  const count = document.getElementById('count');
  const filterBtns = document.querySelectorAll('.filters button');

  let tasks = load();
  let filter = 'all';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(tasks)); } catch (e) {}
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    tasks.unshift({ id: Date.now(), text: text, done: false });
    input.value = '';
    save(); render();
  });

  filterBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      filter = b.dataset.filter;
      filterBtns.forEach(function (x) { x.classList.toggle('active', x === b); });
      render();
    });
  });

  document.getElementById('clear').addEventListener('click', function () {
    tasks = tasks.filter(function (t) { return !t.done; });
    save(); render();
  });

  function startEdit(li, task) {
    const span = li.querySelector('.text');
    const field = document.createElement('input');
    field.className = 'edit';
    field.value = task.text;
    field.maxLength = 120;
    span.replaceWith(field);
    field.focus();
    let finished = false;
    function finish(commit) {
      if (finished) return;
      finished = true;
      const v = field.value.trim();
      if (commit && v) task.text = v;
      save(); render();
    }
    field.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') finish(true);
      if (e.key === 'Escape') finish(false);
    });
    field.addEventListener('blur', function () { finish(true); });
  }

  function render() {
    const visible = tasks.filter(function (t) {
      return filter === 'all' || (filter === 'done' ? t.done : !t.done);
    });
    list.innerHTML = '';
    visible.forEach(function (task) {
      const li = document.createElement('li');
      if (task.done) li.className = 'done';

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = task.done;
      cb.setAttribute('aria-label', 'Mark “' + task.text + '” as done');
      cb.addEventListener('change', function () {
        task.done = cb.checked; save(); render();
      });

      const span = document.createElement('span');
      span.className = 'text';
      span.textContent = task.text;
      span.title = 'Click to edit';
      span.addEventListener('click', function () { startEdit(li, task); });

      const del = document.createElement('button');
      del.className = 'del';
      del.type = 'button';
      del.innerHTML = '&times;';
      del.setAttribute('aria-label', 'Delete “' + task.text + '”');
      del.addEventListener('click', function () {
        tasks = tasks.filter(function (t) { return t.id !== task.id; });
        save(); render();
      });

      li.append(cb, span, del);
      list.appendChild(li);
    });

    const left = tasks.filter(function (t) { return !t.done; }).length;
    count.textContent = tasks.length
      ? left + (left === 1 ? ' task left' : ' tasks left')
      : 'Nothing here yet';

    const msgs = {
      all: 'No tasks yet. Type one above and press Add task.',
      active: 'No active tasks. Nice work.',
      done: 'No completed tasks yet.'
    };
    empty.hidden = visible.length > 0;
    empty.textContent = msgs[filter];
  }

  render();
})();
