/*
 * @Author: Delevin.TnT
 * @LastEditors: Delevin.TnT
 * @Date: 2021-11-03 21:20:00
 * @LastEditTime: 2021-11-04 17:26:36
 */
type HET = HTMLElement

interface Nodes {
    top: number
    left: number
    background: string
    id: string
}

interface Dom extends Omit<Nodes, 'background'> {
    el: HET
}
interface DataTree {
    [k: string]: Array<Omit<Nodes, 'background' | 'id'> & { el: HET }>
}
class DomRender {
    nodeList: Nodes[]
    Root: HET
    dataTree: DataTree = {}
    keyOrder: Array<string> = []
    moveIndex: { Index: number } = { Index: 0 }
    constructor(nodeList: Nodes[]) {
        this.nodeList = nodeList
        this.Root = document.getElementById('app')
        new RecallAndRecover(this.dataTree, this.keyOrder, this.moveIndex)
    }

    renderDom() {
        this.nodeList.forEach((node: Nodes) => {
            this.dataTree[node.id] = this.dataTree[node.id] ?? []

            const domNode: HET = document.createElement('div')
            for (let k in node) {
                domNode.style[k] = k !== 'background' ? node[k] + 'px' : node[k];
                domNode.innerText = node.id
            }
            this.dataTree[node.id].push({
                top: node.top,
                left: node.left,
                el: domNode
            })
            RecallAndRecover.bakData({
                top: node.top,
                left: node.left,
                el: domNode
            }, node.id)
            new Drag(domNode, node, this.dataTree, this.keyOrder, this.moveIndex)
            this.Root.append(domNode)
        })
    }
}

class Drag {
    distX: number = 0
    distY: number = 0
    constructor(domNode: HET, node: Nodes, dataTree: DataTree, keyOrder: Array<string>, moveIndex: { Index: number }) {
        this.bindEvent(domNode, node, dataTree, keyOrder, moveIndex)
    }
    bindEvent(domNode: HET, { id, top, left }, dataTree: DataTree, keyOrder: Array<string>, moveIndex: { Index: number }) {
        domNode.onmousedown = ({ clientX, clientY }) => {
            this.distX = clientX - domNode.offsetLeft;
            this.distY = clientY - domNode.offsetTop;

            document.onmousemove = ({ clientX, clientY }) => {
                domNode.style.left = clientX - this.distX + 'px';
                domNode.style.top = clientY - this.distY + 'px';
            }
            document.onmouseup = ({ clientX, clientY }) => {
                document.onmousemove = null;
                document.onmouseup = null;
                dataTree[id] = dataTree[id] ?? []
                dataTree[id].push({
                    top: clientY - this.distY,
                    left: clientX - this.distX,
                    el: domNode
                })
                keyOrder.push(id)
                moveIndex.Index++
                RecallAndRecover.bakData({
                    top: clientY - this.distY,
                    left: clientX - this.distX,
                    el: domNode
                }, id)
            }
        }
    }
}

class RecallAndRecover {
    Recall: HET = document.getElementById('recall')
    Recover: HET = document.getElementById('recover')
    static dataTreeBak: DataTree = {}
    static keyOrderBak: Array<string> = []
    static dataTreeBakNext = []
    static keyOrderBakNext: Array<string> = []
    constructor(dataTree: DataTree, keyOrder: Array<string>, moveIndex: { Index: number }) {
        this.bindEvent(dataTree, keyOrder, moveIndex)
    }
    static bakData(data, id) {
        RecallAndRecover.dataTreeBak[id] = RecallAndRecover.dataTreeBak[id] ?? []
        RecallAndRecover.dataTreeBak[id].push(data)
        RecallAndRecover.keyOrderBak.push(id)
    }
    bindEvent(dataTree: DataTree, keyOrder: Array<string>, moveIndex: { Index: number }) {
        this.Recall.addEventListener('click', () => {
            const DmID = RecallAndRecover.keyOrderBak[RecallAndRecover.keyOrderBak.length - 1]
            const DmArr = RecallAndRecover.dataTreeBak[DmID];
            const DomEl = dataTree[DmID][0].el;
            const top = DmArr[DmArr.length - 2].top
            const left = DmArr[DmArr.length - 2].left
            DomEl.style.top = top + 'px'
            DomEl.style.left = left + 'px'
            const id = RecallAndRecover.keyOrderBak.pop()
            const node = RecallAndRecover.dataTreeBak[DmID].pop()
            RecallAndRecover.keyOrderBakNext.push(id)
            RecallAndRecover.dataTreeBakNext.push(node)

        })

        this.Recover.addEventListener('click', () => {
            const rrID = RecallAndRecover.keyOrderBakNext[RecallAndRecover.keyOrderBakNext.length - 1]
            const rrNode = RecallAndRecover.dataTreeBakNext[RecallAndRecover.dataTreeBakNext.length - 1]
            RecallAndRecover.dataTreeBak[rrID].push(rrNode)
            RecallAndRecover.keyOrderBak.push(rrID)

            const DmID = RecallAndRecover.keyOrderBak[RecallAndRecover.keyOrderBak.length - 1]
            const DmArr = RecallAndRecover.dataTreeBak[DmID];
            const DomEl = dataTree[DmID][0].el;
            const top = DmArr[DmArr.length - 1].top
            const left = DmArr[DmArr.length - 1].left
            DomEl.style.top = top + 'px'
            DomEl.style.left = left + 'px'
            RecallAndRecover.dataTreeBakNext.pop()
            RecallAndRecover.keyOrderBakNext.pop()

        })
    }
}



const options: Nodes[] = [
    {
        top: 0,
        left: 0,
        background: 'red',
        id: 'A'
    },
    {
        top: 0,
        left: 500,
        background: 'blue',
        id: 'B'
    },
    {
        top: 500,
        left: 500,
        background: 'green',
        id: 'C'
    },
    {
        top: 500,
        left: 0,
        background: 'yellow',
        id: 'E'
    },
    {
        top: 250,
        left: 250,
        background: 'pink',
        id: 'F'
    }
]
const instance = new DomRender(options)
instance.renderDom()