//
//  ViewController.swift
//  CustomSwipeableCellTableView
//
//  Created by Nitin Bhatia on 22/12/17.
//  Copyright © 2017 Nitin Bhatia. All rights reserved.
//

import UIKit

class ViewController: UIViewController,UITableViewDelegate,UITableViewDataSource,SwipeableTableViewCellDelegate {
    
    @IBOutlet weak var tableView: UITableView!
    var cellsCurrentlyEditing = Set<AnyHashable>()

    override func viewDidLoad() {
        super.viewDidLoad()
        cellsCurrentlyEditing = Set<AnyHashable>()

        // Do any additional setup after loading the view, typically from a nib.
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    func numberOfSections(in tableView: UITableView) -> Int {
        return 1
    }
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return 10
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "Cell", for: indexPath) as! SwipeableTableViewCell
        cell.lblTitle.text = "Hello \(indexPath.row)"
        cell.delegate = self
       
        if cellsCurrentlyEditing.contains(indexPath) {
            cell.openCell()
        }

        return cell
    }
    
    func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        return 68
    }
    
    
    func cellDidOpen(_ cell: SwipeableTableViewCell) {
        let currentEditingIndexPath: IndexPath? = tableView.indexPath(for: cell)
        let index = cellsCurrentlyEditing.first
        
        if(index != nil){
            let x = tableView.cellForRow(at: index as! IndexPath) as! SwipeableTableViewCell
            x.resetConstraintContstants(toZero: true, notifyDelegateDidClose: true)
        }
        
        self.cellsCurrentlyEditing.insert(currentEditingIndexPath ?? IndexPath(row: 0, section: 0))
        print(cellsCurrentlyEditing)
        //let x = tableView.cellForRow(at: cellsCurrentlyEditing.)
        
    }
    
    func cellDidClose(_ cell: UITableViewCell) {
        while let elementIndex = cellsCurrentlyEditing.index(of: tableView.indexPath(for: cell)!) { cellsCurrentlyEditing.remove(at: elementIndex) }
    }
    
    func btnEdit(forItemText itemText: String) {
        print(itemText)
    }
    
    func btnDelete(forItemText itemText: String) {
        print(itemText)
    }

    


}

