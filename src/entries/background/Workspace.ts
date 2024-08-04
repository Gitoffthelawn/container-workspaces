export class Workspace {
    private items: number[] = [];

    constructor(initialItems?: number[]) {
        if (initialItems) {
            this.items = initialItems.filter((item, index, self) => self.indexOf(item) === index);
        }
    }

    // Add a new element to the front
    unshift(element: number) {
        this.remove(element);
        this.items.unshift(element);
    }

    // Add a new element to the back
    push(element: number) {
        this.remove(element);
        this.items.push(element);
    }

    // Removes an element from the list
    remove(element: number) {
        this.items = this.items.filter((item) => item !== element);
    }

    // Get the items in the set
    getItems(): number[] {
        return this.items;
    }

    // Get the element at the given index
    get(index: number): number | undefined {
        if (this.length() > index) {
            return this.items[index];
        }
        return undefined;
    }

    // Get the first element
    first(): number | undefined {
        if (this.length() > 0) {
            return this.items[0];
        }
        return undefined;
    }

    // Get the first element
    last(): number | undefined {
        if (this.length() > 0) {
            return this.items[this.length() - 1];
        }
        return undefined;
    }

    // Returns true if the set contains the given element
    contains(element: number): boolean {
        let contains = false;
        this.items.forEach((item) => {
            if (item === element) {
                contains = true;
            }
        });
        return contains;
    }

    length(): number {
        return this.items.length;
    }
}
