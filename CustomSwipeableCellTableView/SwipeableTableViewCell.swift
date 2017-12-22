//
//  SwipeableTableViewCell.swift
//  CustomSwipeableCellTableView
//
//  Created by Nitin Bhatia on 22/12/17.
//  Copyright © 2017 Nitin Bhatia. All rights reserved.
//

import UIKit

protocol SwipeableTableViewCellDelegate {
    func cellDidOpen(_ cell: SwipeableTableViewCell)
    
    func cellDidClose(_ cell: UITableViewCell)
    
    func btnDelete(forItemText itemText:String)
    func btnEdit(forItemText itemText:String)

}

class SwipeableTableViewCell: UITableViewCell {
    
    @IBOutlet weak var btnEdit: UIButton!
    @IBOutlet weak var btnDelete: UIButton!
    var delegate : SwipeableTableViewCellDelegate!
    
    @IBOutlet weak var myContentView: UIView!
    //swipeable
    var panRecognizer: UIPanGestureRecognizer?
    var panStartPoint = CGPoint.zero
    var startingRightLayoutConstraintConstant: CGFloat = 0.0
    @IBOutlet weak var contentViewRightConstraint: NSLayoutConstraint!
    @IBOutlet weak var contentViewLeftConstraint: NSLayoutConstraint!
    @IBOutlet weak var lblTitle: UILabel!
    private let kBounceValue: CGFloat = 20.0
    
    override func awakeFromNib() {
        super.awakeFromNib()
        
        panRecognizer = UIPanGestureRecognizer(target: self, action: #selector(self.panThisCell))
        panRecognizer?.delegate = self
        myContentView.addGestureRecognizer(panRecognizer!)
        
    }
    
    @IBAction func buttonClicked(_ sender: UIButton) {
        if sender == btnDelete {
            delegate.btnDelete(forItemText: lblTitle.text!)
        }
        else if sender == btnEdit {
            delegate.btnEdit(forItemText: lblTitle.text!)
        }
        else {
            print("Clicked unknown button!")
        }
        
    }

    
    func buttonTotalWidth() -> CGFloat {
        //subtract that button frame which is left most or which is last from right to left
        return frame.width - btnEdit.frame.minX
    }
    
    func openCell() {
        self.setConstraintsToShowAllButtons(false, notifyDelegateDidOpen: false)
    }
    
    func resetConstraintContstants(toZero animated: Bool, notifyDelegateDidClose notifyDelegate: Bool) {
        //The below notify the delegate when a swipe gesture has completed and the cell has either opened or closed the menu.
        if (notifyDelegate) {
            self.delegate.cellDidClose(self)
        }
        
        if startingRightLayoutConstraintConstant == 0 && contentViewRightConstraint.constant == 0 {
            //Already all the way closed, no bounce necessary
            return
        }
        contentViewRightConstraint.constant = -kBounceValue
        contentViewLeftConstraint.constant = kBounceValue
        updateConstraintsIfNeeded(animated, completion: {(_ finished: Bool) -> Void in
            self.contentViewRightConstraint.constant = 0
            self.contentViewLeftConstraint.constant = 0
            self.updateConstraintsIfNeeded(animated, completion: {(_ finished: Bool) -> Void in
                self.startingRightLayoutConstraintConstant = self.contentViewRightConstraint.constant
            })
        })
    }

    
    func setConstraintsToShowAllButtons(_ animated: Bool, notifyDelegateDidOpen notifyDelegate: Bool) {
        //The below notify the delegate when a swipe gesture has completed and the cell has either opened or closed the menu.
        if (notifyDelegate) {
            self.delegate.cellDidOpen(self)
        }
        //1
        if startingRightLayoutConstraintConstant == buttonTotalWidth() && contentViewRightConstraint.constant == buttonTotalWidth() {
            return
        }
        //2
        contentViewLeftConstraint.constant = -buttonTotalWidth() - kBounceValue
        contentViewRightConstraint.constant = buttonTotalWidth() + kBounceValue
        updateConstraintsIfNeeded(animated, completion: {(_ finished: Bool) -> Void in
            //3
            self.contentViewLeftConstraint.constant = -self.buttonTotalWidth()
            self.contentViewRightConstraint.constant = self.buttonTotalWidth()
            self.updateConstraintsIfNeeded(animated, completion: {(_ finished: Bool) -> Void in
                //4
                self.startingRightLayoutConstraintConstant = self.contentViewRightConstraint.constant
            })
        })
    }
    
    func updateConstraintsIfNeeded(_ animated: Bool, completion: @escaping (_ finished: Bool) -> Void) {
        var duration: Float = 0
        if animated {
            duration = 0.1
        }
        UIView.animate(withDuration: duration as? TimeInterval ?? 0.0, delay: 0, options: .curveEaseOut, animations: {() -> Void in
            self.layoutIfNeeded()
        }, completion: completion)
    }
    
    //First, your UIPanGestureRecognizer can sometimes interfere with the one which handles the scroll action on the UITableView. Since you’ve already set up the cell to be the pan gesture recognizer's UIGestureRecognizerDelegate, you only have to implement one (comically verbosely named) delegate method to make this work.
    //This method tells the gesture recognizers that they can both work at the same time.
    override func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer) -> Bool {
        return true
    }
    
    //There's still an issue with cell reuse: rows don't remember their state, so as cells are reused their opened/closed state in the view won't reflect the actions of the user. To see this, open a cell, then scroll the table a bit. You'll notice that one cell always remains open, but it's a different one each time.
    //This method ensures the cell re-closes before it's recycled.
    
    override func prepareForReuse() {
        super.prepareForReuse()
        resetConstraintContstants(toZero: false, notifyDelegateDidClose: false)
    }
    
   @objc func panThisCell(_ recognizer: UIPanGestureRecognizer) {
        switch recognizer.state {
        case .began:
            panStartPoint = recognizer.translation(in: myContentView)
            startingRightLayoutConstraintConstant = contentViewRightConstraint.constant
        case .changed:
            let currentPoint: CGPoint = recognizer.translation(in: myContentView)
            let deltaX: CGFloat = currentPoint.x - panStartPoint.x
            var panningLeft = false
            if (currentPoint.x < self.panStartPoint.x) {  //1
                panningLeft = true
            }
            
            
            if (self.startingRightLayoutConstraintConstant == 0) { //2
                //The cell was closed and is now opening
                if (!panningLeft) {
                    let constant: CGFloat = max(-deltaX, 0)
                    if (constant == 0) { //4
                        let constant: CGFloat = min(-deltaX, buttonTotalWidth())
                    }else { //5
                        self.contentViewRightConstraint.constant = constant;
                    }
                } else {
                    let constant: CGFloat = min(-deltaX, buttonTotalWidth())
                   
                    if (constant == self.buttonTotalWidth()) {
                        self.setConstraintsToShowAllButtons(true, notifyDelegateDidOpen: false)
                    }else { //8
                        self.contentViewRightConstraint.constant = constant;
                    }
                }
            }
            else {
                //The cell was at least partially open.
                let adjustment: CGFloat = startingRightLayoutConstraintConstant - deltaX
                //1
                if !panningLeft {
                    let constant: CGFloat = max(adjustment, 0)
                    //2
                    if constant == 0 {
                        //3
                        resetConstraintContstants(toZero: true, notifyDelegateDidClose: false)
                    }
                    else {
                        //4
                        contentViewRightConstraint.constant = constant
                    }
                }
                else {
                    let constant: CGFloat = min(adjustment, buttonTotalWidth())
                    //5
                    if constant == buttonTotalWidth() {
                        //6
                        setConstraintsToShowAllButtons(true, notifyDelegateDidOpen: false)
                    }
                    else {
                        //7
                        contentViewRightConstraint.constant = constant
                    }
                }
            }
            contentViewLeftConstraint.constant = -contentViewRightConstraint.constant
            
        case .ended:
            if (self.startingRightLayoutConstraintConstant == 0) { //1
                //Cell was opening
                let halfOfButtonOne: CGFloat = btnDelete.frame.width/2 // 2
                if (self.contentViewRightConstraint.constant >= halfOfButtonOne) { //3
                    //Open all the way
                    self.setConstraintsToShowAllButtons(true, notifyDelegateDidOpen: true)
                } else {
                    //Re-close
                    self.resetConstraintContstants(toZero: true, notifyDelegateDidClose: true)
                }
            } else {
                //Cell was closing
                let buttonOnePlusHalfOfButton2: CGFloat =  btnEdit.frame.width / 2 + btnDelete.frame.width //4
                if (self.contentViewRightConstraint.constant >= buttonOnePlusHalfOfButton2) { //5
                    //Re-open all the way
                    self.setConstraintsToShowAllButtons(true, notifyDelegateDidOpen: true)
                } else {
                    //Close
                    self.resetConstraintContstants(toZero: true, notifyDelegateDidClose: true)
                }
            }

        case .cancelled:
            if (self.startingRightLayoutConstraintConstant == 0) {
                //Cell was closed - reset everything to 0
                self.resetConstraintContstants(toZero: true, notifyDelegateDidClose: true)
            } else {
                //Cell was open - reset to the open state
                self.setConstraintsToShowAllButtons(true, notifyDelegateDidOpen: true)
            }
        default:
            break
        }
    }
    
    
   



    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }

}
