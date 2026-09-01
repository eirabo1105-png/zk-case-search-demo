(() => {
      const root = document.getElementById('zk-case-search-demo');
      if (!root) return;

      const folders = [
        {
          type: 'folder', id: 'test-case', name: '测试案件', children: [
            { type: 'graph', id: 'g-1', name: '图谱1（5）', fields: { address: ['0x7A2F...91C4', '0x91D0...77E1'], tx: ['0x8d10...c021'], keyword: ['重点关注地址'], sticky: ['测试图谱'] } },
            { type: 'graph', id: 'g-2', name: '图谱2', fields: { address: ['0xF12A...2B88'], tx: ['0x12ab...8821'], keyword: ['待核查'], sticky: ['杭州'] } },
            { type: 'graph', id: 'g-3', name: '图谱3', fields: { address: ['0x7A2F...91C4', '0x3C8D...A70E'], tx: ['0xabc1...79ef'], keyword: ['一次性中转地址'], sticky: ['专项研判'] } }
          ]
        },
        {
          type: 'folder', id: 'wallet-case', name: '钱包系统测试', children: [
            {
              type: 'folder', id: 'zj', name: '浙江省', children: [
                { type: 'graph', id: 'g-zj', name: '浙江省资金关系', fields: { address: ['0x7A2F...91C4', '0x91D0...77E1'], tx: ['0x8d10...c021'], keyword: ['重点关注地址'], sticky: ['浙江省重点线索'] } },
                {
                  type: 'folder', id: 'hz', name: '杭州市公安局', children: [
                    { type: 'graph', id: 'g-hz', name: '杭州公安专题', fields: { address: ['0x7A2F...91C4', '0xF12A...2B88'], tx: ['0x12ab...8821'], keyword: ['重点关注', '杭州中转地址'], sticky: ['杭州'] } },
                    {
                      type: 'folder', id: 'fraud', name: '电诈案件', children: [
                        { type: 'graph', id: 'g-618', name: '6.18 专项案件', fields: { address: ['0x7A2F...91C4', '0x3C8D...A70E', '0xA011...3D42'], tx: ['0xabc1...79ef', '0x6e90...a117'], keyword: ['一次性中转地址'], sticky: ['杭州', '专项研判'] } },
                        { type: 'graph', id: 'g-old', name: '历史资金流', fields: { address: ['0x91D0...77E1'], tx: ['0x22aa...0912'], keyword: ['历史线索'], sticky: ['历史资金图谱要点', '重点关注资金流向', '涉及多个中转地址', '需进一步核查'] } }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ];

      const els = {
        sidebar: root.querySelector('.zk-sidebar'),
        treeScroll: root.querySelector('#zk-tree-scroll'),
        treeMount: root.querySelector('#zk-tree-mount'),
        searchToggle: root.querySelector('[data-demo-action="toggle-search"]'),
        searchView: root.querySelector('#zk-search-view'),
        searchInput: root.querySelector('#zk-search-input'),
        searchClear: root.querySelector('[data-demo-action="clear-search"]'),
        graphSvg: root.querySelector('#zk-graph-svg'),
        canvasTitle: root.querySelector('#zk-canvas-title'),
        canvasPath: root.querySelector('#zk-canvas-path'),
        toast: root.querySelector('#zk-toast'),
        contextMenu: root.querySelector('#zk-graph-context-menu'),
        folderContextMenu: root.querySelector('#zk-folder-context-menu'),
        newCaseModal: root.querySelector('#zk-new-case-modal'),
        newCaseName: root.querySelector('#zk-new-case-name'),
        newCaseNameError: root.querySelector('#zk-new-case-name-error'),
        parentError: root.querySelector('#zk-parent-error'),
        parentPicker: root.querySelector('.zk-parent-picker'),
        parentSearch: root.querySelector('#zk-parent-search'),
        parentSearchClear: root.querySelector('[data-demo-action="clear-parent-search"]'),
        parentTree: root.querySelector('#zk-parent-tree'),
        renameGraphModal: root.querySelector('#zk-rename-graph-modal'),
        renameGraphName: root.querySelector('#zk-rename-graph-name'),
        renameGraphNameError: root.querySelector('#zk-rename-graph-name-error'),
        graphNameCount: root.querySelector('#zk-graph-name-count'),
        renameFolderModal: root.querySelector('#zk-rename-folder-modal'),
        renameFolderName: root.querySelector('#zk-rename-folder-name'),
        renameFolderNameError: root.querySelector('#zk-rename-folder-name-error'),
        folderNameCount: root.querySelector('#zk-folder-name-count'),
        deleteFolderModal: root.querySelector('#zk-delete-folder-modal'),
        shareGraphModal: root.querySelector('#zk-share-graph-modal'),
        shareGraphName: root.querySelector('#zk-share-graph-name'),
        shareGraphLink: root.querySelector('#zk-share-graph-link'),
        deleteGraphModal: root.querySelector('#zk-delete-graph-modal'),
        deleteGraphName: root.querySelector('#zk-delete-graph-name'),
        moveGraphModal: root.querySelector('#zk-move-graph-modal'),
        moveGraphName: root.querySelector('#zk-move-graph-name'),
        moveParentPicker: root.querySelector('#zk-move-parent-picker'),
        moveParentSearch: root.querySelector('#zk-move-parent-search'),
        moveParentSearchClear: root.querySelector('[data-demo-action="clear-move-parent-search"]'),
        moveParentTree: root.querySelector('#zk-move-parent-tree'),
        moveError: root.querySelector('#zk-move-error')
      };

      const state = {
        expanded: { 'test-case': true, 'wallet-case': false, zj: false, hz: false, fraud: false },
        searchExpanded: {},
        searchActive: false,
        searchTerm: '',
        advancedOpen: false,
        conditions: [],
        selectedGraph: 'g-3',
        newCaseParentId: undefined,
        parentSearchTerm: '',
        parentExpanded: { root: true, 'wallet-case': false, zj: false, hz: false, fraud: false },
        contextGraphId: null,
        renameGraphId: null,
        deleteGraphId: null,
        moveGraphId: null,
        moveTargetId: null,
        moveParentSearchTerm: '',
        moveParentExpanded: {},
        shareLink: '',
        folderContextId: null,
        renameFolderId: null,
        deleteFolderId: null,
        toastTimer: null
      };

      const labels = { name: '名称', address: '地址', tx: '交易哈希', keyword: '关键词' };
      const placeholders = { name: '匹配文件夹或图谱名称', address: '输入地址', tx: '输入交易哈希', keyword: '匹配备注、便签等内容' };
      const conditionTypes = ['name', 'address', 'tx', 'keyword'];

      function escapeHtml(value) {
        return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
      }

      function includesText(value, term) {
        return String(value || '').toLowerCase().includes(String(term || '').trim().toLowerCase());
      }

      function allGraphText(graph, key) {
        const values = (graph.fields && graph.fields[key]) || [];
        return Array.isArray(values) ? values : [values];
      }

      function graphKeywordText(graph) {
        return [
          ...allGraphText(graph, 'keyword'),
          ...allGraphText(graph, 'remark'),
          ...allGraphText(graph, 'sticky')
        ];
      }

      function conditionMatchesGraph(condition, graph, path) {
        const value = condition.value.trim();
        if (!value) return true;
        if (condition.type === 'name') return [graph.name, ...(path || []).map(folder => folder.name)].some(valueItem => includesText(valueItem, value));
        if (condition.type === 'address') return allGraphText(graph, 'address').some(valueItem => includesText(valueItem, value));
        if (condition.type === 'tx') return allGraphText(graph, 'tx').some(valueItem => includesText(valueItem, value));
        if (condition.type === 'keyword') return graphKeywordText(graph).some(valueItem => includesText(valueItem, value));
        return false;
      }

      function graphMatches(graph, conditions, path) {
        return conditions.filter(item => item.value.trim()).every(condition => conditionMatchesGraph(condition, graph, path));
      }

      function folderMatchesDirect(folder, conditions, path) {
        const nonEmpty = conditions.filter(item => item.value.trim());
        return nonEmpty.length > 0 && nonEmpty.every(condition => condition.type === 'name' && includesText(folder.name, condition.value));
      }

      function makeGraphRow(graph, path, match) {
        return { ...graph, path, match, children: [] };
      }

      function filterTree(nodes, conditions, parentPath = []) {
        const output = [];
        nodes.forEach(node => {
          if (node.type === 'graph') {
            if (graphMatches(node, conditions, parentPath)) output.push(makeGraphRow(node, parentPath, true));
            return;
          }
          const directFolderHit = folderMatchesDirect(node, conditions, parentPath);
          if (directFolderHit) {
            output.push({ ...node, path: parentPath, match: true, children: node.children || [], directFolderHit: true });
            return;
          }
          const nextPath = [...parentPath, node];
          const childResults = filterTree(node.children || [], conditions, nextPath);
          if (childResults.length || directFolderHit) {
            output.push({ ...node, path: parentPath, match: directFolderHit, children: childResults, directFolderHit });
            if (childResults.length) state.searchExpanded[node.id] = true;
          }
        });
        return output;
      }

      function filterGeneral(nodes, term, parentPath = []) {
        const output = [];
        nodes.forEach(node => {
          if (node.type === 'graph') {
            const graphHit = [node.name, ...allGraphText(node, 'address'), ...allGraphText(node, 'tx'), ...graphKeywordText(node)].some(value => includesText(value, term));
            if (graphHit) output.push(makeGraphRow(node, parentPath, true));
            return;
          }
          const folderHit = includesText(node.name, term);
          if (folderHit) {
            output.push({ ...node, path: parentPath, match: true, children: [], directFolderHit: true });
            return;
          }
          const nextPath = [...parentPath, node];
          const childResults = filterGeneral(node.children || [], term, nextPath);
          if (childResults.length || folderHit) {
            output.push({ ...node, path: parentPath, match: folderHit, children: childResults, directFolderHit: folderHit });
            if (childResults.length) state.searchExpanded[node.id] = true;
          }
        });
        return output;
      }

      function renderTree(nodes, isSearch = false) {
        if (!nodes.length) {
          els.treeMount.innerHTML = '<div class="zk-search-empty">暂无相关内容</div>';
          return;
        }
        let html = isSearch ? '<div class="zk-tree-section-label">搜索结果</div>' : '<div class="zk-pinned-empty">暂无置顶数据</div>';
        html += nodes.map(node => renderNode(node, 0, isSearch)).join('');
        els.treeMount.innerHTML = html;
      }

      function renderNode(node, level, isSearch) {
        const indent = level * 20;
        if (node.type === 'graph') {
          const selected = node.id === state.selectedGraph ? ' is-selected' : '';
          const hit = isSearch && node.match ? ' is-search-hit' : '';
          return `<div class="zk-tree-row${selected}${hit}" data-tree-level="${level}" data-tree-type="graph" data-id="${node.id}" style="--zk-tree-level:${level};--zk-tree-guide-left:${Math.max(0, level * 20 - 2)}px;padding-left:${indent + 8}px" title="打开图谱"><button class="zk-tree-toggle" type="button" tabindex="-1" aria-hidden="true"></button><span class="zk-tree-icon graph" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 12h4M13 7l3-2M13 17l3 2"></path><circle cx="5" cy="12" r="2.5"></circle><circle cx="18" cy="5" r="2.5"></circle><circle cx="18" cy="19" r="2.5"></circle></svg></span><span class="zk-tree-name">${escapeHtml(node.name)}</span></div>`;
        }
        const hasChildren = (node.children || []).length > 0;
        const isOpen = hasChildren && (isSearch ? Boolean(state.searchExpanded[node.id]) : Boolean(state.expanded[node.id]));
        const childHtml = isOpen ? (node.children || []).map(child => renderNode(child, level + 1, isSearch)).join('') : '';
        const hit = isSearch && node.match ? ' is-search-hit' : '';
        const branch = isSearch && hasChildren && !node.match ? ' is-search-branch' : '';
        const openFolder = !isSearch && isOpen ? ' is-folder-open' : '';
        const addGraph = !isSearch ? `<button class="zk-folder-add-graph" type="button" data-demo-action="add-graph" data-folder-id="${node.id}" title="在此文件夹新增图谱" aria-label="在${escapeHtml(node.name)}中新增图谱"><svg class="zk-folder-add-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"></circle><path d="M12 8v8M8 12h8"></path></svg></button>` : '';
        const toggle = hasChildren ? `<button class="zk-tree-toggle" type="button" data-tree-action="toggle" data-id="${node.id}" aria-label="${isOpen ? '收起' : '展开'}">${isOpen ? '⌃' : '⌄'}</button>` : '<span class="zk-tree-toggle is-empty" aria-hidden="true"></span>';
        return `<div class="zk-tree-row${hit}${branch}${openFolder}" data-tree-level="${level}" data-tree-type="folder" data-id="${node.id}" style="--zk-tree-level:${level};--zk-tree-guide-left:${Math.max(0, level * 20 - 2)}px;padding-left:${indent + 8}px"><span class="zk-tree-icon folder" aria-hidden="true"></span><span class="zk-tree-name">${escapeHtml(node.name)}</span>${addGraph}${toggle}</div>${childHtml}`;
      }

      function flattenFind(nodes, id) {
        for (const node of nodes) {
          if (node.id === id) return node;
          if (node.children) {
            const found = flattenFind(node.children, id);
            if (found) return found;
          }
        }
        return null;
      }

      function findPath(nodes, id, path = []) {
        for (const node of nodes) {
          if (node.id === id) return path;
          if (node.children) {
            const found = findPath(node.children, id, node.type === 'folder' ? [...path, node] : path);
            if (found) return found;
          }
        }
        return null;
      }

      function graphNameExistsExcept(nodes, name, excludedId) {
        return nodes.some(node => node.type === 'graph'
          ? node.id !== excludedId && node.name.trim() === name
          : graphNameExistsExcept(node.children || [], name, excludedId));
      }

      function closeGraphContextMenu() {
        els.contextMenu.hidden = true;
        state.contextGraphId = null;
      }

      function openGraphContextMenu(event, graphId) {
        event.preventDefault();
        event.stopPropagation();
        closeFolderContextMenu();
        const bounds = els.sidebar.getBoundingClientRect();
        const menuWidth = 156;
        const menuHeight = 5 * 40 + 12;
        const maxLeft = Math.max(8, els.sidebar.clientWidth - menuWidth - 8);
        const maxTop = Math.max(8, els.sidebar.clientHeight - menuHeight - 8);
        state.contextGraphId = graphId;
        els.contextMenu.style.left = `${Math.max(8, Math.min(event.clientX - bounds.left, maxLeft))}px`;
        els.contextMenu.style.top = `${Math.max(8, Math.min(event.clientY - bounds.top, maxTop))}px`;
        els.contextMenu.hidden = false;
      }

      function getRenameGraphError() {
        const name = els.renameGraphName.value.trim();
        if (!name) return '请输入图谱名称';
        if (graphNameExistsExcept(folders, name, state.renameGraphId)) return '图谱名称已存在';
        return '';
      }

      function updateRenameGraphValidation() {
        const message = getRenameGraphError();
        const invalid = Boolean(message);
        els.graphNameCount.textContent = `${els.renameGraphName.value.length}/20`;
        els.renameGraphName.classList.toggle('is-invalid', invalid);
        if (invalid) els.renameGraphName.setAttribute('aria-invalid', 'true');
        else els.renameGraphName.removeAttribute('aria-invalid');
        els.renameGraphNameError.textContent = message || '请输入图谱名称';
        els.renameGraphNameError.hidden = !invalid;
        return !invalid;
      }

      function openRenameGraph(graph) {
        state.renameGraphId = graph.id;
        els.renameGraphName.value = graph.name;
        els.graphNameCount.textContent = `${graph.name.length}/20`;
        els.renameGraphName.classList.remove('is-invalid');
        els.renameGraphName.removeAttribute('aria-invalid');
        els.renameGraphNameError.hidden = true;
        els.renameGraphModal.hidden = false;
        els.renameGraphName.focus();
        els.renameGraphName.select();
      }

      function closeRenameGraph() {
        els.renameGraphModal.hidden = true;
        state.renameGraphId = null;
      }

      function submitRenameGraph() {
        if (!updateRenameGraphValidation()) {
          els.renameGraphName.focus();
          return;
        }
        const graph = flattenFind(folders, state.renameGraphId);
        if (!graph || graph.type !== 'graph') return;
        graph.name = els.renameGraphName.value.trim();
        closeRenameGraph();
        renderCurrentTree();
        showSuccessToast('图谱重命名成功');
      }

      function collectFolders(nodes, result = []) {
        nodes.forEach(node => {
          if (node.type !== 'folder') return;
          result.push(node);
          collectFolders(node.children || [], result);
        });
        return result;
      }

      function removeNodeById(nodes, id) {
        for (let index = 0; index < nodes.length; index += 1) {
          if (nodes[index].id === id) return nodes.splice(index, 1)[0];
          if (nodes[index].children) {
            const removed = removeNodeById(nodes[index].children, id);
            if (removed) return removed;
          }
        }
        return null;
      }

      function findFirstGraph(nodes) {
        for (const node of nodes) {
          if (node.type === 'graph') return node;
          const graph = findFirstGraph(node.children || []);
          if (graph) return graph;
        }
        return null;
      }

      function refreshSelectedGraph() {
        const graph = flattenFind(folders, state.selectedGraph);
        if (!graph) return;
        const path = findPath(folders, graph.id).map(node => node.name);
        els.canvasTitle.textContent = graph.name;
        els.canvasPath.textContent = path.join(' / ');
        renderCanvasSearchHighlights(graph);
      }

      function openShareGraph(graph) {
        state.shareLink = `http://dev.bitjungle.cn/chart?graphId=${encodeURIComponent(graph.id)}&accessCode=demo-${encodeURIComponent(graph.id)}`;
        els.shareGraphName.textContent = graph.name;
        els.shareGraphLink.textContent = state.shareLink;
        els.shareGraphModal.hidden = false;
      }

      function closeShareGraph() {
        els.shareGraphModal.hidden = true;
        state.shareLink = '';
      }

      function copyShareLink() {
        if (navigator.clipboard && state.shareLink) navigator.clipboard.writeText(state.shareLink).catch(() => {});
        showSuccessToast('链接已复制');
      }

      function openDeleteGraph(graph) {
        state.deleteGraphId = graph.id;
        els.deleteGraphName.textContent = graph.name;
        els.deleteGraphModal.hidden = false;
      }

      function closeDeleteGraph() {
        els.deleteGraphModal.hidden = true;
        state.deleteGraphId = null;
      }

      function submitDeleteGraph() {
        const graph = flattenFind(folders, state.deleteGraphId);
        if (!graph || graph.type !== 'graph') return;
        const removed = removeNodeById(folders, graph.id);
        closeDeleteGraph();
        if (removed && state.selectedGraph === graph.id) {
          const fallback = findFirstGraph(folders);
          state.selectedGraph = fallback ? fallback.id : null;
          if (fallback) refreshSelectedGraph();
        }
        renderCurrentTree();
        showSuccessToast('图谱删除成功');
      }

      function renderMoveParentOptions(nodes, level = 0) {
        return nodes.map(node => {
          if (node.type !== 'folder') return '';
          const selected = state.moveTargetId === node.id ? ' is-selected' : '';
          const match = state.moveParentSearchTerm && node.parentSearchMatch ? ' is-match' : '';
          const childFolders = (node.children || []).filter(child => child.type === 'folder');
          const isExpanded = state.moveParentSearchTerm ? childFolders.length > 0 : Boolean(state.moveParentExpanded[node.id]);
          const toggle = childFolders.length ? `<button class="zk-parent-toggle ${isExpanded ? 'is-open' : 'is-closed'}" type="button" data-demo-action="toggle-move-parent" data-parent-id="${node.id}" aria-label="${isExpanded ? '收起' : '展开'}"></button>` : '<span class="zk-parent-toggle is-empty" aria-hidden="true"></span>';
          const children = isExpanded ? renderMoveParentOptions(childFolders, level + 1) : '';
          return `<div class="zk-parent-node"><div class="zk-parent-row" style="padding-left:${level * 18}px">${toggle}<button class="zk-parent-option${selected}${match}" type="button" data-demo-action="select-move-parent" data-parent-id="${node.id}"><span class="zk-parent-check" aria-hidden="true"></span><span class="zk-parent-folder" aria-hidden="true"></span><span>${escapeHtml(node.name)}</span></button></div>${children}</div>`;
        }).join('');
      }

      function renderMoveParentTree() {
        const rootFolders = folders.filter(node => node.type === 'folder');
        const searchTerm = state.moveParentSearchTerm.trim();
        const visibleFolders = searchTerm ? filterParentFolders(rootFolders, searchTerm) : rootFolders;
        els.moveParentSearchClear.hidden = !searchTerm;
        els.moveParentTree.innerHTML = visibleFolders.length
          ? renderMoveParentOptions(visibleFolders)
          : '<div class="zk-parent-empty">未找到匹配的目录</div>';
      }

      function openMoveGraph(graph) {
        state.moveGraphId = graph.id;
        state.moveParentSearchTerm = '';
        state.moveParentExpanded = {};
        collectFolders(folders).forEach(folder => { state.moveParentExpanded[folder.id] = true; });
        const path = findPath(folders, graph.id) || [];
        const currentParent = path[path.length - 1];
        state.moveTargetId = currentParent ? currentParent.id : null;
        els.moveGraphName.textContent = graph.name;
        els.moveParentSearch.value = '';
        els.moveParentPicker.classList.remove('is-invalid');
        els.moveError.hidden = true;
        renderMoveParentTree();
        els.moveGraphModal.hidden = false;
      }

      function closeMoveGraph() {
        els.moveGraphModal.hidden = true;
        state.moveGraphId = null;
        state.moveTargetId = null;
        state.moveParentSearchTerm = '';
        els.moveError.hidden = true;
        els.moveParentPicker.classList.remove('is-invalid');
      }

      function submitMoveGraph() {
        const graph = flattenFind(folders, state.moveGraphId);
        const targetId = state.moveTargetId;
        const target = flattenFind(folders, targetId);
        if (!graph || graph.type !== 'graph' || !target || target.type !== 'folder') {
          els.moveParentPicker.classList.add('is-invalid');
          els.moveError.hidden = false;
          return;
        }
        const moved = removeNodeById(folders, graph.id);
        if (!moved) return;
        target.children = target.children || [];
        target.children.push(moved);
        findPath(folders, target.id).forEach(folder => { state.expanded[folder.id] = true; });
        state.expanded[target.id] = true;
        closeMoveGraph();
        renderCurrentTree();
        refreshSelectedGraph();
        showSuccessToast('图谱移动成功');
      }

      function handleGraphMenuAction(action) {
        const graph = flattenFind(folders, state.contextGraphId);
        closeGraphContextMenu();
        if (!graph || graph.type !== 'graph') return;
        if (action === 'rename') {
          openRenameGraph(graph);
          return;
        }
        if (action === 'share') {
          openShareGraph(graph);
          return;
        }
        if (action === 'delete') {
          openDeleteGraph(graph);
          return;
        }
        if (action === 'move') {
          openMoveGraph(graph);
          return;
        }
        if (action === 'pin') showToast('置顶图谱入口');
      }

      function closeFolderContextMenu() {
        els.folderContextMenu.hidden = true;
        state.folderContextId = null;
      }

      function openFolderContextMenu(event, folderId) {
        event.preventDefault();
        event.stopPropagation();
        closeGraphContextMenu();
        const bounds = els.sidebar.getBoundingClientRect();
        const menuWidth = 156;
        const menuHeight = 2 * 40 + 12;
        const maxLeft = Math.max(8, els.sidebar.clientWidth - menuWidth - 8);
        const maxTop = Math.max(8, els.sidebar.clientHeight - menuHeight - 8);
        state.folderContextId = folderId;
        els.folderContextMenu.style.left = `${Math.max(8, Math.min(event.clientX - bounds.left, maxLeft))}px`;
        els.folderContextMenu.style.top = `${Math.max(8, Math.min(event.clientY - bounds.top, maxTop))}px`;
        els.folderContextMenu.hidden = false;
      }

      function getFolderRenameError() {
        const name = els.renameFolderName.value.trim();
        if (!name) return '请输入案件名称';
        const path = findPath(folders, state.renameFolderId) || [];
        const parentId = path.length ? path[path.length - 1].id : null;
        if (getSiblingFolders(parentId).some(folder => folder.id !== state.renameFolderId && folder.name.trim() === name)) return '案件名称已存在';
        if (graphNameExists(folders, name)) return '名称已被图谱使用';
        return '';
      }

      function updateFolderRenameValidation() {
        const message = getFolderRenameError();
        const invalid = Boolean(message);
        els.folderNameCount.textContent = `${els.renameFolderName.value.length}/20`;
        els.renameFolderName.classList.toggle('is-invalid', invalid);
        if (invalid) els.renameFolderName.setAttribute('aria-invalid', 'true');
        else els.renameFolderName.removeAttribute('aria-invalid');
        els.renameFolderNameError.textContent = message || '请输入案件名称';
        els.renameFolderNameError.hidden = !invalid;
        return !invalid;
      }

      function openRenameFolder(folder) {
        state.renameFolderId = folder.id;
        els.renameFolderName.value = folder.name;
        els.folderNameCount.textContent = `${folder.name.length}/20`;
        els.renameFolderName.classList.remove('is-invalid');
        els.renameFolderName.removeAttribute('aria-invalid');
        els.renameFolderNameError.hidden = true;
        els.renameFolderModal.hidden = false;
        els.renameFolderName.focus();
        els.renameFolderName.select();
      }

      function closeRenameFolder() {
        els.renameFolderModal.hidden = true;
        state.renameFolderId = null;
      }

      function submitRenameFolder() {
        if (!updateFolderRenameValidation()) {
          els.renameFolderName.focus();
          return;
        }
        const folder = flattenFind(folders, state.renameFolderId);
        if (!folder || folder.type !== 'folder') return;
        folder.name = els.renameFolderName.value.trim();
        closeRenameFolder();
        renderCurrentTree();
        refreshSelectedGraph();
        showSuccessToast('案件重命名成功');
      }

      function openDeleteFolder(folder) {
        state.deleteFolderId = folder.id;
        els.deleteFolderModal.hidden = false;
      }

      function closeDeleteFolder() {
        els.deleteFolderModal.hidden = true;
        state.deleteFolderId = null;
      }

      function submitDeleteFolder() {
        const folder = flattenFind(folders, state.deleteFolderId);
        if (!folder || folder.type !== 'folder') return;
        const deletedSelectedGraph = Boolean(state.selectedGraph && flattenFind([folder], state.selectedGraph));
        const removed = removeNodeById(folders, folder.id);
        closeDeleteFolder();
        if (removed && deletedSelectedGraph) {
          const fallback = findFirstGraph(folders);
          state.selectedGraph = fallback ? fallback.id : null;
          if (fallback) refreshSelectedGraph();
        }
        renderCurrentTree();
        showSuccessToast('案件删除成功');
      }

      function handleFolderMenuAction(action) {
        const folder = flattenFind(folders, state.folderContextId);
        closeFolderContextMenu();
        if (!folder || folder.type !== 'folder') return;
        if (action === 'rename') {
          openRenameFolder(folder);
          return;
        }
        if (action === 'delete') openDeleteFolder(folder);
      }

      function renderCanvasSearchHighlights(graph) {
        const svg = els.graphSvg;
        if (!svg) return;
        svg.classList.toggle('is-history', Boolean(graph && graph.id === 'g-old'));
        svg.querySelectorAll('.is-search-hit').forEach(node => node.classList.remove('is-search-hit'));
        if (!graph || graph.id !== 'g-old' || !state.searchActive) return;

        const term = state.searchTerm.trim();
        const matches = value => Boolean(term) && includesText(value, term);

        svg.querySelectorAll('[data-history-address]').forEach(node => {
          const nodeAddress = node.getAttribute('data-history-address') || '';
          const nodeKeyword = node.getAttribute('data-history-keyword') || '';
          const nodeHit = matches(nodeAddress) || matches(nodeKeyword);
          node.querySelector('.zk-history-node, .zk-history-target')?.classList.toggle('is-search-hit', nodeHit);
        });
        svg.querySelectorAll('[data-history-tx]').forEach(edge => {
          edge.classList.toggle('is-search-hit', matches(edge.getAttribute('data-history-tx') || ''));
        });
        svg.querySelectorAll('[data-history-keyword]').forEach(note => {
          note.classList.toggle('is-search-hit', matches(note.getAttribute('data-history-keyword') || ''));
        });
      }

      function openGraph(id) {
        const graph = flattenFind(folders, id);
        if (!graph || graph.type !== 'graph') return;
        state.selectedGraph = id;
        const path = findPath(folders, id).map(node => node.name);
        els.canvasTitle.textContent = graph.name;
        els.canvasPath.textContent = path.join(' / ');
        renderCanvasSearchHighlights(graph);
        renderCurrentTree();
        showToast(`已打开：${graph.name}`);
      }

      function renderCurrentTree() {
        if (!state.searchActive) {
          renderTree(folders, false);
          renderCanvasSearchHighlights(flattenFind(folders, state.selectedGraph));
          return;
        }
        const results = filterGeneral(folders, state.searchTerm);
        renderTree(results, true);
        renderCanvasSearchHighlights(flattenFind(folders, state.selectedGraph));
      }

      function filterParentFolders(nodes, term) {
        return nodes.map(node => {
          const childFolders = (node.children || []).filter(child => child.type === 'folder');
          const matchedChildren = filterParentFolders(childFolders, term);
          const selfMatch = includesText(node.name, term);
          if (!selfMatch && !matchedChildren.length) return null;
          return { ...node, children: matchedChildren, parentSearchMatch: selfMatch };
        }).filter(Boolean);
      }

      function renderParentOptions(nodes, level = 0) {
        return nodes.map(node => {
          if (node.type !== 'folder') return '';
          const selected = (state.newCaseParentId || '') === node.id ? ' is-selected' : '';
          const match = state.parentSearchTerm && node.parentSearchMatch ? ' is-match' : '';
          const childFolders = (node.children || []).filter(child => child.type === 'folder');
          const isExpanded = state.parentSearchTerm ? childFolders.length > 0 : Boolean(state.parentExpanded[node.id]);
          const toggle = childFolders.length ? `<button class="zk-parent-toggle ${isExpanded ? 'is-open' : 'is-closed'}" type="button" data-demo-action="toggle-parent" data-parent-id="${node.id}" aria-label="${isExpanded ? '收起' : '展开'}"></button>` : '<span class="zk-parent-toggle is-empty" aria-hidden="true"></span>';
          const children = isExpanded ? renderParentOptions(childFolders, level + 1) : '';
          return `<div class="zk-parent-node"><div class="zk-parent-row" style="padding-left:${level * 18}px">${toggle}<button class="zk-parent-option${selected}${match}" type="button" data-demo-action="select-parent" data-parent-id="${node.id}"><span class="zk-parent-check" aria-hidden="true"></span><span class="zk-parent-folder" aria-hidden="true"></span><span>${escapeHtml(node.name)}</span></button></div>${children}</div>`;
        }).join('');
      }

      function renderParentTree() {
        const rootSelected = state.newCaseParentId === null ? ' is-selected' : '';
        const rootFolders = folders.filter(node => node.type === 'folder');
        const searchTerm = state.parentSearchTerm.trim();
        const visibleFolders = searchTerm ? filterParentFolders(rootFolders, searchTerm) : rootFolders;
        const rootExpanded = searchTerm ? true : state.parentExpanded.root !== false;
        const rootToggle = searchTerm ? '<span class="zk-parent-toggle is-empty" aria-hidden="true"></span>' : (rootFolders.length ? `<button class="zk-parent-toggle ${rootExpanded ? 'is-open' : 'is-closed'}" type="button" data-demo-action="toggle-parent" data-parent-id="root" aria-label="${rootExpanded ? '收起根目录' : '展开根目录'}"></button>` : '<span class="zk-parent-toggle is-empty" aria-hidden="true"></span>');
        const children = rootExpanded ? renderParentOptions(visibleFolders, 1) : '';
        const empty = searchTerm && !visibleFolders.length ? '<div class="zk-parent-empty">未找到匹配的目录</div>' : '';
        els.parentSearchClear.hidden = !searchTerm;
        els.parentTree.innerHTML = `<div class="zk-parent-node"><div class="zk-parent-row">${rootToggle}<button class="zk-parent-option${rootSelected}" type="button" data-demo-action="select-parent" data-parent-id=""><span class="zk-parent-check" aria-hidden="true"></span><span class="zk-parent-root-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m3 10 9-7 9 7v11H3z"></path><path d="M9 21v-7h6v7"></path></svg></span><span>根目录</span></button></div>${children}${empty}</div>`;
      }

      function clearNewCaseValidation() {
        els.newCaseName.classList.remove('is-invalid');
        els.newCaseName.removeAttribute('aria-invalid');
        els.newCaseNameError.hidden = true;
        els.newCaseNameError.textContent = '请输入案件名称';
        els.parentPicker.classList.remove('is-invalid');
        els.parentError.hidden = true;
        els.parentError.textContent = '请选择所属目录';
      }

      function getSiblingFolders(parentId) {
        if (parentId === null) return folders.filter(node => node.type === 'folder');
        const parent = flattenFind(folders, parentId);
        return (parent?.children || []).filter(node => node.type === 'folder');
      }

      function graphNameExists(nodes, name) {
        return nodes.some(node => node.type === 'graph'
          ? node.name.trim() === name
          : graphNameExists(node.children || [], name));
      }

      function getNewCaseNameError() {
        const name = els.newCaseName.value.trim();
        if (!name) return '请输入案件名称';
        if (typeof state.newCaseParentId === 'undefined') return '';
        if (getSiblingFolders(state.newCaseParentId).some(folder => folder.name.trim() === name)) {
          return '案件名称已存在';
        }
        if (graphNameExists(folders, name)) return '名称已被图谱使用';
        return '';
      }

      function updateNewCaseNameValidation() {
        const message = getNewCaseNameError();
        const invalid = Boolean(message);
        els.newCaseName.classList.toggle('is-invalid', invalid);
        if (invalid) els.newCaseName.setAttribute('aria-invalid', 'true');
        else els.newCaseName.removeAttribute('aria-invalid');
        els.newCaseNameError.textContent = message || '请输入案件名称';
        els.newCaseNameError.hidden = !invalid;
        return !invalid;
      }

      function setParentError(message) {
        els.parentPicker.classList.add('is-invalid');
        els.parentError.textContent = message;
        els.parentError.hidden = false;
      }

      function validateNewCase() {
        const nameValid = updateNewCaseNameValidation();
        const parentInvalid = typeof state.newCaseParentId === 'undefined';
        els.parentPicker.classList.toggle('is-invalid', parentInvalid);
        els.parentError.textContent = '请选择所属目录';
        els.parentError.hidden = !parentInvalid;
        if (!nameValid) els.newCaseName.focus();
        return nameValid && !parentInvalid;
      }

      function openNewCaseModal() {
        state.newCaseParentId = undefined;
        state.parentSearchTerm = '';
        els.newCaseName.value = '';
        els.parentSearch.value = '';
        clearNewCaseValidation();
        renderParentTree();
        els.newCaseModal.hidden = false;
        els.newCaseName.focus();
      }

      function closeNewCaseModal() {
        els.newCaseModal.hidden = true;
      }

      function folderDepth(nodes, id, depth = 1) {
        for (const node of nodes) {
          if (node.type !== 'folder') continue;
          if (node.id === id) return depth;
          const nestedDepth = folderDepth(node.children || [], id, depth + 1);
          if (nestedDepth) return nestedDepth;
        }
        return 0;
      }

      function submitNewCase() {
        const name = els.newCaseName.value.trim();
        if (!validateNewCase()) return;
        const parentDepth = state.newCaseParentId === null ? 0 : folderDepth(folders, state.newCaseParentId);
        if (parentDepth >= 4) {
          setParentError('已达目录层级上限');
          return;
        }
        const newFolder = { type: 'folder', id: `folder-${Date.now()}`, name, children: [] };
        if (state.newCaseParentId) {
          const parent = flattenFind(folders, state.newCaseParentId);
          if (!parent || parent.type !== 'folder') return;
          parent.children = parent.children || [];
          parent.children.push(newFolder);
          findPath(folders, state.newCaseParentId).forEach(folder => { state.expanded[folder.id] = true; });
          state.expanded[parent.id] = true;
        } else {
          folders.push(newFolder);
        }
        closeNewCaseModal();
        if (state.searchActive) closeSearch();
        renderCurrentTree();
        showSuccessToast('案件添加成功');
      }

      function showToast(message) {
        els.toast.textContent = message;
        els.toast.classList.remove('success');
        els.toast.classList.add('show');
        clearTimeout(state.toastTimer);
        state.toastTimer = setTimeout(() => els.toast.classList.remove('show'), 1500);
      }

      function showSuccessToast(message) {
        els.toast.innerHTML = `<span class="zk-toast-check" aria-hidden="true">✓</span><span>${escapeHtml(message)}</span>`;
        els.toast.classList.add('show', 'success');
        clearTimeout(state.toastTimer);
        state.toastTimer = setTimeout(() => {
          els.toast.classList.remove('show', 'success');
          els.toast.textContent = '';
        }, 1800);
      }

      function clearSearchState() {
        state.searchActive = false;
        state.searchTerm = '';
        state.searchExpanded = {};
      }

      function updateSearchControls() {
        const isOpen = !els.searchView.hidden;
        els.searchToggle.setAttribute('aria-expanded', String(isOpen));
        els.searchClear.hidden = !els.searchInput.value;
      }

      function closeSearch() {
        clearSearchState();
        els.searchInput.value = '';
        els.searchView.hidden = true;
        els.treeScroll.hidden = false;
        updateSearchControls();
        renderCurrentTree();
      }

      function openSearch() {
        els.searchView.hidden = false;
        els.treeScroll.hidden = false;
        updateSearchControls();
        els.searchInput.focus();
      }

      function toggleSearch() {
        if (!els.searchView.hidden) {
          closeSearch();
          return;
        }
        openSearch();
      }

      function runSearch() {
        const term = els.searchInput.value.trim();
        if (!term) {
          showToast('请输入搜索内容');
          els.searchInput.focus();
          return;
        }
        state.searchTerm = term;
        state.searchActive = true;
        state.searchExpanded = {};
        renderCurrentTree();
      }

      function clearSearchInput() {
        els.searchInput.value = '';
        state.searchTerm = '';
        state.searchActive = false;
        state.searchExpanded = {};
        updateSearchControls();
        renderCurrentTree();
        els.searchInput.focus();
      }

      function handleSearchKeydown(event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          runSearch();
        }
      }

      root.addEventListener('contextmenu', event => {
        const row = event.target.closest('[data-tree-type="graph"]');
        if (row) {
          openGraphContextMenu(event, row.dataset.id);
          return;
        }
        const folderRow = event.target.closest('[data-tree-type="folder"]');
        if (folderRow) {
          openFolderContextMenu(event, folderRow.dataset.id);
          return;
        }
        closeGraphContextMenu();
        closeFolderContextMenu();
      });

      root.addEventListener('click', event => {
        const actionNode = event.target.closest('[data-demo-action]');
        if (actionNode) {
          const action = actionNode.dataset.demoAction;
          if (action === 'graph-menu') {
            handleGraphMenuAction(actionNode.dataset.graphMenuAction);
            return;
          }
          if (action === 'folder-menu') {
            handleFolderMenuAction(actionNode.dataset.folderMenuAction);
            return;
          }
          closeGraphContextMenu();
          closeFolderContextMenu();
          if (action === 'toggle-search') toggleSearch();
          if (action === 'run-search') runSearch();
          if (action === 'clear-search') clearSearchInput();
          if (action === 'close-new-case') closeNewCaseModal();
          if (action === 'submit-new-case') submitNewCase();
          if (action === 'close-rename-graph') closeRenameGraph();
          if (action === 'submit-rename-graph') submitRenameGraph();
          if (action === 'close-rename-folder') closeRenameFolder();
          if (action === 'submit-rename-folder') submitRenameFolder();
          if (action === 'close-delete-folder') closeDeleteFolder();
          if (action === 'submit-delete-folder') submitDeleteFolder();
          if (action === 'close-share-graph') closeShareGraph();
          if (action === 'copy-share-link') copyShareLink();
          if (action === 'close-delete-graph') closeDeleteGraph();
          if (action === 'submit-delete-graph') submitDeleteGraph();
          if (action === 'close-move-graph') closeMoveGraph();
          if (action === 'submit-move-graph') submitMoveGraph();
          if (action === 'clear-move-parent-search') {
            state.moveParentSearchTerm = '';
            els.moveParentSearch.value = '';
            renderMoveParentTree();
            els.moveParentSearch.focus();
          }
          if (action === 'select-move-parent') {
            state.moveTargetId = actionNode.dataset.parentId;
            els.moveParentPicker.classList.remove('is-invalid');
            els.moveError.hidden = true;
            renderMoveParentTree();
          }
          if (action === 'toggle-move-parent') {
            const parentId = actionNode.dataset.parentId;
            state.moveParentExpanded[parentId] = !state.moveParentExpanded[parentId];
            renderMoveParentTree();
          }
          if (action === 'clear-parent-search') {
            state.parentSearchTerm = '';
            els.parentSearch.value = '';
            renderParentTree();
            els.parentSearch.focus();
          }
          if (action === 'select-parent') {
            state.newCaseParentId = actionNode.dataset.parentId || null;
            els.parentPicker.classList.remove('is-invalid');
            els.parentError.hidden = true;
            els.parentError.textContent = '请选择所属目录';
            updateNewCaseNameValidation();
            renderParentTree();
          }
          if (action === 'toggle-parent') {
            const parentId = actionNode.dataset.parentId;
            state.parentExpanded[parentId] = !state.parentExpanded[parentId];
            renderParentTree();
          }
          if (action === 'create') showToast('创建图谱入口');
          if (action === 'add-folder') openNewCaseModal();
          if (action === 'add-graph') showToast('新增图谱入口');
          return;
        }

        closeGraphContextMenu();
        closeFolderContextMenu();

        const toggle = event.target.closest('[data-tree-action="toggle"]');
        if (toggle) {
          const id = toggle.dataset.id;
          const target = state.searchActive ? state.searchExpanded : state.expanded;
          target[id] = !target[id];
          renderCurrentTree();
          return;
        }

        const row = event.target.closest('[data-tree-type]');
        if (row && row.dataset.treeType === 'graph') openGraph(row.dataset.id);
      });

      root.addEventListener('input', event => {
        if (event.target.id === 'zk-new-case-name') {
          updateNewCaseNameValidation();
          return;
        }
        if (event.target.id === 'zk-rename-graph-name') {
          updateRenameGraphValidation();
          return;
        }
        if (event.target.id === 'zk-rename-folder-name') {
          updateFolderRenameValidation();
          return;
        }
        if (event.target.id === 'zk-parent-search') {
          state.parentSearchTerm = event.target.value;
          renderParentTree();
          return;
        }
        if (event.target.id === 'zk-move-parent-search') {
          state.moveParentSearchTerm = event.target.value;
          renderMoveParentTree();
          return;
        }
        if (event.target.id === 'zk-search-input') {
          els.searchClear.hidden = !event.target.value;
        }
      });

      els.searchInput.addEventListener('keydown', handleSearchKeydown);

      els.newCaseName.addEventListener('keydown', event => {
        if (event.key === 'Enter') submitNewCase();
      });

      els.renameGraphName.addEventListener('keydown', event => {
        if (event.key === 'Enter') submitRenameGraph();
      });

      els.renameFolderName.addEventListener('keydown', event => {
        if (event.key === 'Enter') submitRenameFolder();
      });

      renderCurrentTree();
    })();
